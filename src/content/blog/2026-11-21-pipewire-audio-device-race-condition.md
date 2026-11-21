---
title: "PipeWire 抢占声卡导致开机无音频设备排查与修复指南"
description: "开机没有找到输入输出设备"
pubDate: "2026-11-21"
heroImage: ""
category: "系统与工具"
tags: ["CachyOS", "PipeWire", "SDDM", "声卡"]
---

## 1. 问题现象与诊断线索

### 1.1 核心故障表现

- **物理设备无法识别**：系统开机进入桌面环境后，输入与输出设备列表为空，音频管理服务无法挂载物理硬件声卡（ALC256 Analog）。
- **退化至虚拟输出**：系统音频自动回退并锁定在虚拟输出（`auto_null` / Dummy Output）模式。
- **用户态重启可临时恢复**：在终端手动执行 `systemctl --user restart pipewire.service pipewire-pulse.service wireplumber.service` 后，音频设备能立即重新挂载，输出恢复为内置音频模拟立体声。

### 1.2 系统日志诊断

从系统启动日志（`journalctl`）中可明确捕获到 ALSA 底层设备争用与节点创建失败的报错：

```text
pipewire[1361]: spa.alsa: 'front:0': playback open failed: 设备或资源忙
wireplumber[1362]: s-monitors: Failed to create ALSA node alsa_output.pci-0000_00_1f.3.analog-stereo: Object activation aborted: enum params id:3 (Spa:Enum:ParamId:EnumFormat) failed
```

---

## 2. 根本原因深度分析

该故障的根源在于**开机初始化阶段两个不同用户的 PipeWire 实例并发抢占同一物理声卡引发的竞态冲突（Race Condition）**。

### 2.1 触发竞态的三个必要条件

| 冲突维度           | 现状配置                        | 机制与冲突作用                                                                                                                            |
| :----------------- | :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **会话提前拉起**   | `systemd linger` 开启           | `/var/lib/systemd/linger/lunaticbaka` 存在，使 `user@1000.service` 在 SDDM 登录前随系统引导立即启动                                       |
| **服务抢跑配置**   | `default.target.wants` 强制自启 | `/etc/systemd/user/default.target.wants/` 及 `~/.config/systemd/user/` 下存在 `pipewire.service` 软链，使其实例在开机立即运行而非按需拉起 |
| **多用户并发争用** | SDDM 登录管理器实例 (UID 948)   | SDDM 启动时会启动自身专用的 PipeWire/WirePlumber 实例尝试探测硬件                                                                         |

### 2.2 冲突时序与失效机制

1. **并发启动**：在开机同一秒内，用户会话（UID 1000）与 SDDM 登录管理器（UID 948）同时拉起各自的 PipeWire 服务。
2. **硬件独占失败**：双方同时尝试通过 ALSA 接口打开硬件声卡通道 `front:0`。
3. **节点创建中止**：抢占失败的一方由于遇到 `设备或资源忙`（EBUSY），其会话管理器 WirePlumber 彻底放弃创建 ALSA 节点。
4. **虚拟输出接管**：进入桌面后，用户会话的音频路由无有效物理 Sink 可用，直接回退为 `auto_null` 虚拟输出。

---

## 3. 永久修复与配置落地

彻底解决该问题的原则是：**恢复 PipeWire 原生的 Socket 按需激活机制，并强制禁止 SDDM 用户实例启动 PipeWire 争抢硬件**。

### 3.1 步骤一：清理强制自启软链（恢复按需激活）

> **重要禁忌**：切勿运行 `systemctl --global disable pipewire.service`。因为该单元文件内包含 `Also=pipewire-pulse.socket` 指令，使用 disable 会连带禁用套接字，导致整个用户态按需拉起机制瘫痪。

直接通过文件系统删除所有非预期的强制自启符号链接：

```bash
# 1. 删除全局层面的强制拉起软链
sudo rm -f /etc/systemd/user/default.target.wants/pipewire.service \
           /etc/systemd/user/default.target.wants/pipewire-pulse.service

# 2. 清理用户配置目录残留的自启软链
rm -f ~/.config/systemd/user/default.target.wants/pipewire.service
```

### 3.2 步骤二：添加 Drop-in 限制，彻底屏蔽 SDDM 用户

为 PipeWire 的服务和套接字单元添加 `ConditionUser=!sddm` 配置。systemd 会对多条条件做逻辑与（AND）校验，从而阻止 SDDM 账号（UID 948）激活任何音频组件。

#### Bash 环境执行：

```bash
for unit in pipewire.socket pipewire-pulse.socket pipewire.service pipewire-pulse.service; do
  sudo install -Dm644 /dev/stdin "/etc/systemd/user/${unit}.d/no-sddm.conf" <<'EOF'
[Unit]
ConditionUser=!sddm
EOF
done
```

#### Fish 环境执行：

由于 Fish Shell 不支持 Bash 的 `<<'EOF'` Heredoc 语法，需使用管道重定向：

```fish
for unit in pipewire.socket pipewire-pulse.socket pipewire.service pipewire-pulse.service
    printf '[Unit]\nConditionUser=!sddm\n' | sudo install -Dm644 /dev/stdin "/etc/systemd/user/$unit.d/no-sddm.conf"
end
```

### 3.3 步骤三：重载并验证服务状态

```bash
systemctl --user daemon-reload
```

---

## 4. 修复前后系统状态与行为比对

经过上述调整后，系统服务状态及运行时表现对比如下：

### 4.1 服务状态对比

| 服务单元                 | 修改前状态            | 修改后预期状态       | 验证指令与要求                               |
| :----------------------- | :-------------------- | :------------------- | :------------------------------------------- |
| `pipewire.socket`        | `enabled` / `active`  | `enabled` / `active` | 包含`no-sddm.conf` 且 ConditionResult 为 yes |
| `pipewire-pulse.socket`  | `enabled` / `active`  | `enabled` / `active` | 同上                                         |
| `pipewire.service`       | `enabled`（开机抢跑） | **`disabled`**       | 仅通过 socket 按需拉起；进入桌面后为`active` |
| `pipewire-pulse.service` | `enabled`（开机抢跑） | **`disabled`**       | 仅通过 socket 按需拉起；进入桌面后为`active` |
| `wireplumber.service`    | `enabled`             | `enabled`            | 随`pipewire.service` 联动启动，保持 `active` |

### 4.2 运行时行为演变

- **SDDM 阶段（UID 948）**：由于命中 `ConditionUser=!sddm`，完全跳过 PipeWire 服务与 Socket 创建，不再占用声卡硬件通道。
- **用户未登录阶段（UID 1000）**：虽然 `systemd linger` 处于激活状态，但因取消了强制自启软链，此时仅保持 Socket 监听，不提前独占硬件声卡。
- **进入桌面阶段**：图形会话及桌面应用接入 PulseAudio / PipeWire Socket，按需触发用户态服务独占打开硬件 ALSA 节点，音频稳定初始化。

---

## 5. 周边兼容性与影响评估

1. **后台常驻服务兼容性**：
    - 账号原有的 `systemd linger`（`/var/lib/systemd/linger/lunaticbaka`）完全保留，依赖开机常驻的后台任务不受任何干扰。
2. **SDDM 壁纸与视频主题兼容性**：
    - **常规主题（静态壁纸 / 纯动画 / 无声视频）**：完全兼容无感知，视频解码与界面渲染 100% 正常。
    - **自带 BGM 或按键音效的主题**：界面视觉与登录鉴权交互一切正常，但由于禁止了 SDDM 用户启动音频堆栈，**登录界面本身将处于静音状态**（成功进入用户桌面后声音完全恢复）。

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
- 在编写代码的时候，请使用注释解释模块的用处和使用方法
- 严格遵守单一职责原则，禁止将 UI/输入输出、业务逻辑、数据存储写在同一个文件或函数中。
- 每次回答只修改或生成一个单一职责的模块/函数，不要一次性输出包含所有逻辑的巨型文件。
- 依赖必须通过参数或接口注入，禁止硬编码耦合。

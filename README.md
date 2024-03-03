# Aspine 2

This website is a clone/improvement of [Aspine](https://github.com/Aspine/aspine).

It is a NextJS site that uses API Routes to scrape the Aspen site with Puppeteer.

## To use locally:

```shell
npm i
npm run dev
```

open `localhost:3000`

## To compile Sass:

run this:

```shell
sass ./src/app/css/globals.scss .src/app/css/globals.css
```

or optionally install the live sass compile extension on vscode. The config file is already in the repository, just install it and scss should work correctly

## get_data_dev vs. get_data

get_data_dev uses solely puppeteer, whilst get_data uses puppeteer-core and @sparticuz/chromium, in order to me able to run serverless, the change in the code is

```ts
const browser = await puppeteer.launch({ headless: true });
```

as opposed to

```ts
const browser = await puppeteer.launch({
    args: Chromium.args,
    defaultViewport: Chromium.defaultViewport,
    executablePath: await Chromium.executablePath(),
    headless: true,
});
```
# Reproduction repo for [a Next.js bug](https://github.com/vercel/next.js/issues/31855)

Exported members that are used in SSR/SSG/ISG page function are undefined on the client (`Attempted import error: '..' is not exported from '..' (imported as '..')`). 


When you export a member that is used in the page function of `getStaticProps`, it will be `undefined` on the client.

For example:

```ts
// pages/index.tsx
export const revalidateInSeconds = 5 * 60;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: revalidateInSeconds,
  };
};

// components/TestComponent.tsx
import { revalidateInSeconds } from "../pages";

export function TestComponent(): JSX.Element {
  console.log("revalidateInSeconds: ", revalidateInSeconds);
  return <p>Test component</p>;
}
```

## Setup

To make sure that the OS has no play in testing this out, I added a [VS Code Docker development container](https://code.visualstudio.com/docs/remote/containers) based on Linux (Debian). With that, even if you don't have Linux, the error can be reproduced.

To test this out:
- In VS Code, install the [Remote Development extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
- Open the repo in VS Code and start the container (popup at the bottom right or via command palette: `Remote-Containers: Rebuild and Repoen in Container`)
- VS Code should restart and be inside the container afterwards

## To Reproduce

### ..use this reproduction repo

1. `npm i`
2. `npm run build`
3. `npm run start`


#### OR

### ..manually execute

1. [Create Next.js app](https://github.com/bennettdams/nextjs-bug-export-undefined/commit/0c812c6fcc7f86a6d49b6c51c94669fc0574b48e): `npx create-next-app@latest --use-npm --ts .`
2. [Add `getStaticProps` and a `const` to export](https://github.com/bennettdams/nextjs-bug-export-undefined/commit/851a9b4e12699c505dc82cc0c587b9abdf3160c6):
```tsx
export const revalidateInSeconds = 5 * 60;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: revalidateInSeconds,
  };
};
```
3. [Add a test component](https://github.com/bennettdams/nextjs-bug-export-undefined/commit/65064110c06af6b6ef20aa08a1e6f49078af45d4) that logs the imported `const` (`revalidateInSeconds`) and use the component on the page:
```tsx
// components/TestComponent.tsx
import { revalidateInSeconds } from "../pages";

export function TestComponent(): JSX.Element {
  console.log("revalidateInSeconds: ", revalidateInSeconds);
  return <p>Test component</p>;
}

// pages/index.ts
...
  <main className={styles.main}>
        <TestComponent />

        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
...
```
4. Build & start the app: `npm run build` & `npm run start`


# Results, looking at the console logs

### Terminal that is used for building:


<details>
  <summary>Click for text!</summary>
  
```
> next build

info  - Checking validity of types  
info  - Creating an optimized production build  
warn  - Compiled with warnings

./components/TestComponent.tsx
Attempted import error: 'revalidateInSeconds' is not exported from '../pages' (imported as 'revalidateInSeconds').

Import trace for requested module:
./pages/index.tsx

info  - Collecting page data  
```
</details>

![image](https://user-images.githubusercontent.com/29319414/143610743-84ce34ea-8ccd-4791-a30b-d765729306c3.png)

### Browser:

![image](https://user-images.githubusercontent.com/29319414/143609672-ac97e487-9700-4285-b1d0-abd36223a28e.png)

---

## Additional information:

- When you run `npm run dev` instead of using the build, you can see that the `console.log` on the server actually has the value, instead of being `undefined`:
![image](https://user-images.githubusercontent.com/29319414/143610000-42fd9e87-2278-42aa-8303-691cc41f3b51.png)
Just on the client it is still `undefined`.

- I checked this behavior also for Next.js `v11.1.2` - there, it is not happening. The variable has its value on the client as expected.



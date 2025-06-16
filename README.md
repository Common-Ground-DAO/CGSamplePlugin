<div align='center'>
    <h1>CG Sample Plugin</h1>
</div>

This sample plugin demonstrates the core capabilities of the [Common Ground Plugin Library](https://github.com/Common-Ground-DAO/CGPluginLib). It provides a practical example of integrating the plugin library, showcasing essential frontend-backend interactions and common use cases.

Use this as a reference implementation to understand how to leverage the full feature set of CG plugins in your own applications.

## Getting Started
Install the dependencies:
```bash
yarn
```
Then run the development server:
```bash
yarn dev
```

The project will start running on [http://localhost:5000](http://localhost:5000). Unfortunately, there's not a lot of use for running this project locally since, as a plugin, it requests all its data from Common Ground when running through an iframe.

To use this plugin, you have three options:

1. Run it locally and host it on your own community:
   - Start your local dev server: `yarn dev`
   - Go to community settings > Plugins > New Plugin
   - Create a new plugin using `http://localhost:5000`
   - That's it! You can now test your plugin on Common Ground!

   ![localhost config](images/localhost.png)

   Be aware that this is not the same as deploying the plugin, this will only work on your machine and while you're running the dev server. In order to have other people use it, you will need to host yout plugin somewhere (option below).

2. Deploy and test it live:
   - Host this project on a server with a public URL (e.g. using Vercel, Netlify, etc.)
   - Register it as a plugin on Common Ground using your public URL
   - Test the plugin functionality within Common Ground's interface

2. Use it as a reference implementation:
   - Use it as a starting point for building your own custom plugin
   - Adapt the functionality to match your specific use case

## Architecture

![diagram](https://github.com/user-attachments/assets/37a77777-160f-4e88-bd6b-63038e7285cc)


## Next steps

For details on how the Plugin Library works and more, be sure to check [the repo for the Plugin Library](https://github.com/Common-Ground-DAO/CGPluginLib)

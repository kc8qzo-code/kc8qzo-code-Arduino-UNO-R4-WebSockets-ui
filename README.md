# ArduinoCommunicationUi

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Production server

Build and serve the optimized application:

```bash
npm run serve:prod
```

The server listens on all network interfaces on port `4200`. Set `HOST` or `PORT`
to override those defaults. Requests under `/api` are proxied to
`http://localhost:8080`; set `API_TARGET` to use a different backend. If the
application has already been built, start only the server with
`npm run start:prod`.

For example, in PowerShell:

```powershell
$env:PORT = 4200
$env:API_TARGET = 'http://localhost:8080'
npm run start:prod
```

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

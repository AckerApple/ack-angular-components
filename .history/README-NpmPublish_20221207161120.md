# Publish Package

Before publishing, update the package version number in:
- package.json
- ack-angular-components/package.json

After running the build command:
- git push `/ack-angular-components` to `master` branch
  - NOTE : I keep a folder called ack-angular-components#dist to copy/paste this folder and push
  - npm publish `ack-angular-components` folder
- git push `/example/www/` to `gh-pages` branch
  - NOTE : I keep a folder called ack-angular-components#gh-pages to copy/paste this folder and push
- git push `/` to `src` branch
  - NOTE : This is what I keep as my root ack-angular-components folder

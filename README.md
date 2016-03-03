# yadl

### Dependencies
- npm
- bower
- ionic

### Plugins
- See ```./plugins.txt``` file

### Running the project

#### To run on browser
```
$ bower install (to install dependencies)
$ ionic serve
```
#### (Optional) Add/Remove a platform
```
$ ionic platform <add/remove> <ios/android>
```
#### To run on emulator
```
$ ionic emulate <ios/android>
```

#### To build
```
$ ionic build <ios/android>
```


### Project Structure
Almost everything that needs to be modified will be found in the ```./www``` directory. ```app.js``` is the entry point and all imports and routes are defined in the ```$stateProvider``` config block.

More information for ```ui-router``` can be found [here](http://angular-ui.github.io/ui-router/site/#/api/ui.router)

Configuring deep links in ionic was done by following [this](https://medium.com/angularjs-articles/deep-linking-in-ionic-mobile-applications-44d8b4685bb3#.y0gkcrhh6) blog post

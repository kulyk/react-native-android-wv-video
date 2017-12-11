# react-native-android-wv-video
Android `WebView` component supporting playing HTML5 videos at fullscreen

## Installation

### Automatic

`npm install react-native-android-wv-video --save`

`react-native link react-native-android-wv-video`

### Manual
in `settings.gradle`

```
include ':react-native-android-wv-video'
project(':react-native-android-wv-video').projectDir = file('../node_modules/react-native-android-wv-video/android')
```

in `android/app/build.gradle`

```
dependencies {
    compile project(':react-native-android-wv-video')
```

in `MainApplication.java`
add package to getPackages()

```java
import com.akulyk.react.androidwebview.AndroidWebViewPackage;

// ...

@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        // ... ,
        new AndroidWebViewPackage()
   );
}
```

## Usage
Same API as for React Native's `WebView`

```
import AndroidWebView from 'react-native-android-wv-video'

...

return <AndroidWebView source={{ uri: html5VideoUrl }} {...restProps} />
```

## Implementation
The problem with full-screen support in Android was resolved by changing the `WebChromeClient` in a `WebView`.

`WebView` component uses the same code and has the same API, as [React Native's own `WebView`](https://facebook.github.io/react-native/docs/webview.html), the only thing, that was changed

## To Do
[ ] - Add support for horizontal full-screen mode 
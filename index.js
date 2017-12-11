'use strict';

var React = require('react');
var ReactNative, {
    ActivityIndicator,
    View,
    requireNativeComponent,
    ViewPropTypes,
    EdgeInsetsPropType,
    UIManager,
    StyleSheet
} = require('react-native');
var PropTypes = require('prop-types');

var defaultRenderLoading = () => (
    <View style={styles.loadingView}>
        <ActivityIndicator
            style={styles.loadingProgressBar}
        />
    </View>
);

const WebViewState = {
    IDLE: 'idle',
    LOADING: 'loading',
    LOADED: 'loaded'
};

var WEBVIEW_REF = 'androidWebView';

class WebView extends React.Component {
    static get extraNativeComponentConfig() {
        return {
            nativeOnly: {
                messagingEnabled: PropTypes.bool,
            },
        };
    }

    static propTypes = {
        ...ViewPropTypes,
        renderError: PropTypes.func,
        renderLoading: PropTypes.func,
        onLoad: PropTypes.func,
        onLoadEnd: PropTypes.func,
        onLoadStart: PropTypes.func,
        onError: PropTypes.func,
        automaticallyAdjustContentInsets: PropTypes.bool,
        contentInset: EdgeInsetsPropType,
        onNavigationStateChange: PropTypes.func,
        onMessage: PropTypes.func,
        onContentSizeChange: PropTypes.func,
        startInLoadingState: PropTypes.bool,
        style: ViewPropTypes.style,

        source: PropTypes.oneOfType([
            PropTypes.shape({
                uri: PropTypes.string,
                method: PropTypes.oneOf(['GET', 'POST']),
                headers: PropTypes.object,
                body: PropTypes.string,
            }),
            PropTypes.shape({
                html: PropTypes.string,
                baseUrl: PropTypes.string,
            }),
            PropTypes.number,
        ]),

        javaScriptEnabled: PropTypes.bool,
        thirdPartyCookiesEnabled: PropTypes.bool,
        domStorageEnabled: PropTypes.bool,
        injectedJavaScript: PropTypes.string,
        scalesPageToFit: PropTypes.bool,
        userAgent: PropTypes.string,
        testID: PropTypes.string,
        mediaPlaybackRequiresUserAction: PropTypes.bool,
        allowUniversalAccessFromFileURLs: PropTypes.bool,
        injectJavaScript: PropTypes.func,
        mixedContentMode: PropTypes.oneOf([
            'never',
            'always',
            'compatibility'
        ]),
        saveFormDataDisabled: PropTypes.bool,
        urlPrefixesForDefaultIntent: PropTypes.arrayOf(PropTypes.string),
    };

    static defaultProps = {
        javaScriptEnabled : true,
        thirdPartyCookiesEnabled: true,
        scalesPageToFit: true,
        saveFormDataDisabled: false
    };

    state = {
        viewState: WebViewState.IDLE,
        lastErrorEvent: null,
        startInLoadingState: true,
    };

    componentWillMount() {
        if (this.props.startInLoadingState) {
            this.setState({viewState: WebViewState.LOADING});
        }
    }

    render() {
        var otherView = null;

        if (this.state.viewState === WebViewState.LOADING) {
            otherView = (this.props.renderLoading || defaultRenderLoading)();
        } else if (this.state.viewState === WebViewState.ERROR) {
            var errorEvent = this.state.lastErrorEvent;
            otherView = this.props.renderError && this.props.renderError(
                errorEvent.domain,
                errorEvent.code,
                errorEvent.description);
        } else if (this.state.viewState !== WebViewState.IDLE) {
            console.error('RNAndroidWebView invalid state encountered: ' + this.state.loading);
        }

        var webViewStyles = [styles.container, this.props.style];
        if (this.state.viewState === WebViewState.LOADING ||
            this.state.viewState === WebViewState.ERROR) {
            // if we're in either LOADING or ERROR states, don't show the webView
            webViewStyles.push(styles.hidden);
        }

        var source = this.props.source || {};
        if (this.props.html) {
            source.html = this.props.html;
        } else if (this.props.url) {
            source.uri = this.props.url;
        }

        if (source.method === 'POST' && source.headers) {
            console.warn('WebView: `source.headers` is not supported when using POST.');
        } else if (source.method === 'GET' && source.body) {
            console.warn('WebView: `source.body` is not supported when using GET.');
        }

        var webView =
            <RNAndroidWebView
                ref={WEBVIEW_REF}
                key="webViewKey"
                style={webViewStyles}
                source={source}
                scalesPageToFit={this.props.scalesPageToFit}
                injectedJavaScript={this.props.injectedJavaScript}
                userAgent={this.props.userAgent}
                javaScriptEnabled={this.props.javaScriptEnabled}
                thirdPartyCookiesEnabled={this.props.thirdPartyCookiesEnabled}
                domStorageEnabled={this.props.domStorageEnabled}
                messagingEnabled={typeof this.props.onMessage === 'function'}
                onMessage={this.onMessage}
                contentInset={this.props.contentInset}
                automaticallyAdjustContentInsets={this.props.automaticallyAdjustContentInsets}
                onContentSizeChange={this.props.onContentSizeChange}
                onLoadingStart={this.onLoadingStart}
                onLoadingFinish={this.onLoadingFinish}
                onLoadingError={this.onLoadingError}
                testID={this.props.testID}
                mediaPlaybackRequiresUserAction={this.props.mediaPlaybackRequiresUserAction}
                allowUniversalAccessFromFileURLs={this.props.allowUniversalAccessFromFileURLs}
                mixedContentMode={this.props.mixedContentMode}
                saveFormDataDisabled={this.props.saveFormDataDisabled}
                urlPrefixesForDefaultIntent={this.props.urlPrefixesForDefaultIntent}
            />;

        return (
            <View style={styles.container}>
                {webView}
                {otherView}
            </View>
        );
    }

    goForward = () => {
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.RNAndroidWebView.Commands.goForward,
            null
        );
    };

    goBack = () => {
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.RNAndroidWebView.Commands.goBack,
            null
        );
    };

    reload = () => {
        this.setState({
            viewState: WebViewState.LOADING
        });
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.RNAndroidWebView.Commands.reload,
            null
        );
    };

    stopLoading = () => {
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.RNAndroidWebView.Commands.stopLoading,
            null
        );
    };

    postMessage = (data) => {
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.RNAndroidWebView.Commands.postMessage,
            [String(data)]
        );
    };

    injectJavaScript = (data) => {
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.RNAndroidWebView.Commands.injectJavaScript,
            [data]
        );
    };

    updateNavigationState = (event) => {
        if (this.props.onNavigationStateChange) {
            this.props.onNavigationStateChange(event.nativeEvent);
        }
    };

    getWebViewHandle = () => {
        return ReactNative.findNodeHandle(this.refs[WEBVIEW_REF]);
    };

    onLoadingStart = (event) => {
        var onLoadStart = this.props.onLoadStart;
        onLoadStart && onLoadStart(event);
        this.updateNavigationState(event);
    };

    onLoadingError = (event) => {
        event.persist();
        var {onError, onLoadEnd} = this.props;
        onError && onError(event);
        onLoadEnd && onLoadEnd(event);
        console.warn('Encountered an error loading page', event.nativeEvent);

        this.setState({
            lastErrorEvent: event.nativeEvent,
            viewState: WebViewState.ERROR
        });
    };

    onLoadingFinish = (event) => {
        var {onLoad, onLoadEnd} = this.props;
        onLoad && onLoad(event);
        onLoadEnd && onLoadEnd(event);
        this.setState({
            viewState: WebViewState.IDLE,
        });
        this.updateNavigationState(event);
    };

    onMessage = (event) => {
        var {onMessage} = this.props;
        onMessage && onMessage(event);
    }
}

var RNAndroidWebView = requireNativeComponent('RNAndroidWebView', WebView, WebView.extraNativeComponentConfig);

var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    hidden: {
        height: 0,
        flex: 0, // disable 'flex:1' when hiding a View
    },
    loadingView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingProgressBar: {
        height: 20,
    },
});

module.exports = WebView;
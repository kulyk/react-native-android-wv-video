'use strict';

var React = require('react');
var RN = require("react-native");
var createClass = require('create-react-class');
var PropTypes = require('prop-types');

var { requireNativeComponent, NativeModules } = require('react-native');
var RCTUIManager = NativeModules.UIManager;

var WEBVIEW_REF = 'androidWebView';

var AndroidWebView = createClass({
    propTypes: {
        url: PropTypes.string,
        source: PropTypes.object,
        baseUrl: PropTypes.string,
        html: PropTypes.string,
        htmlCharset: PropTypes.string,
        userAgent: PropTypes.string,
        injectedJavaScript: PropTypes.string,
        disablePlugins: PropTypes.bool,
        javaScriptEnabled: PropTypes.bool,
        allowUrlRedirect: PropTypes.bool,
        onNavigationStateChange: PropTypes.func
    },
    _onNavigationStateChange: function(event) {
        if (this.props.onNavigationStateChange) {
            this.props.onNavigationStateChange(event.nativeEvent);
        }
    },
    goBack: function() {
        RCTUIManager.dispatchViewManagerCommand(
            this._getWebViewHandle(),
            RCTUIManager.RNAndroidWebView.Commands.goBack,
            null
        );
    },
    goForward: function() {
        RCTUIManager.dispatchViewManagerCommand(
            this._getWebViewHandle(),
            RCTUIManager.RNAndroidWebView.Commands.goForward,
            null
        );
    },
    reload: function() {
        RCTUIManager.dispatchViewManagerCommand(
            this._getWebViewHandle(),
            RCTUIManager.RNAndroidWebView.Commands.reload,
            null
        );
    },
    stopLoading: function() {
        RCTUIManager.dispatchViewManagerCommand(
            this._getWebViewHandle(),
            RCTUIManager.RNAndroidWebView.Commands.stopLoading,
            null
        );
    },
    postMessage: function(data) {
        RCTUIManager.dispatchViewManagerCommand(
            this._getWebViewHandle(),
            RCTUIManager.RNAndroidWebView.Commands.postMessage,
            [String(data)]
        );
    },
    injectJavaScript: function(data) {
        RCTUIManager.dispatchViewManagerCommand(
            this._getWebViewHandle(),
            RCTUIManager.RNAndroidWebView.Commands.injectJavaScript,
            [data]
        );
    },
    onMessage: function(event) {
        if (this.props.onMessage) {
            this.props.onMessage(event);
        }
    },
    render: function() {
        return <RNAndroidWebView ref={WEBVIEW_REF}
                                 {...this.props}
                                 onMessage={this.onMessage}
                                 onNavigationStateChange={this._onNavigationStateChange} />;
    },
    _getWebViewHandle: function() {
        return RN.findNodeHandle(this.refs[WEBVIEW_REF]);
    }
});

var RNAndroidWebView = requireNativeComponent('RNAndroidWebView', null);

module.exports = AndroidWebView;

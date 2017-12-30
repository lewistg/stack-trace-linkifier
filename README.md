# Stack Trace Linkifier 

This Chrome extension linkifies the source code locations in stack trace text
embedded in web pages. The extension was originally written to make it easier to
navigate to failing [Jasmine](https://jasmine.github.io/) unit test code. When
a test fails, Jasmine reports the failure with a stack trace. See it in action:

![Recording of extension in action](https://github.com/lewistg/stack-trace-links/raw/master/readme-imgs/recording.gif)

The extension only inserts stack frame links while the dev tools are open. The
links are also inserted when the dev tools are first opened. When the dev tools
are closed, the links are removed.

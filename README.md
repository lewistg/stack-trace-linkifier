# Stack Trace Linkifier 

This Chrome extension linkifies stack traces embedded in web pages the way the
Chrome DevTools linkifies stack traces reported in the console. Namely, it
inserts a link to the source code location referenced in the stack frame text.
The extension was originally written to make it easier to navigate to failing
[Jasmine](https://jasmine.github.io/) unit test code, which reports failing
unit tests with accompanying stack traces. You can see it in action in this
context here:

![Recording of extension in action](https://github.com/lewistg/stack-trace-links/raw/master/readme-imgs/recording.gif)

The extension only inserts the links while the DevTools are open. The links
are also inserted when the DevTools are first opened. When the DevTools are
closed, the links are removed.

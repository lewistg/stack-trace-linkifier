# Stack Trace Linkifier 

This Chrome extension turns stack frames in stack traces into links to the
source. This extension was originally written to make it easier to navigate to
failing [Jasmine](https://jasmine.github.io/) unit test code. (When a test
fails, Jasmine reports the failure with a stack trace.)

The extension only inserts stack frame links while the dev tools are open. The
links are also inserted when the dev tools are first opened. When the dev tools
are closed, the links are removed.

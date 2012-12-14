# Pronto.js Release Notes

Release notes, beginning with 0.3.11

## 0.3.15

## 0.3.14

* Fixed an error in HTTP error handling. This error was temporarily
stopping the event loop from answering requests when an uncaught
exception was handled by the HTTP server.

## 0.3.13

* Added StreamedHTTPResponse.
* Added AddToContext.

## 0.3.12

* BufferedReader now correctly handles encoding and decoding of buffers.
* Logger is now available to @serverStartup.

## 0.3.11

* Added a StringReader utility class to treat strings like read streams.

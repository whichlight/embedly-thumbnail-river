# Embedly Thumbnail River

This is a demo using Stream from Embedly.  Thumbnail River pulls from the stream
and includes the embed responses.  Each thumbnail URL is cropped using
[Display]("http://embed.ly/display").

You can use the Stream endpoint to access the firehose of embeds.  Process the
stream to identify hot and trending articles. Filter the stream to get specific
kinds of articles.

## Server

A simple server is written in node.  Request is used to pull from the stream,
and the results are piped to a bufferstream.  Each URL in the stream is
separated by a new line. The bufferstream watches for new lines and sends the
data to the client with socketio.

## Client

The thumbnail of the embed is animated on the client with jQuery animations, but
only if the number of images is below some threshold.  This is to ensure that
the client does not get overloaded with images and slow down.

## Trending

Periodically, Thumbnail River scans over all of the images currently in view and finds the most
frequent URLs. The titles of these URLs are displayed over the stream.

## API Key

The API key for Stream is stored in `config.js` and accessed by `server.js`.  The
API key for Display is in `api_key.js` and is accessed by `client.js`.  These
files are not in this repo.

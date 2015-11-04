Instantsearch.js website
=========================

# Development

```sh
$ bundle install
$ bundle exec guard # watch & live-reload
$ open http://localhost:4000/instantsearch.js/
```

# MacOS

If you are using `brew` and you had `brew install openssl`, you may need to configure the build path of eventmachine with

```
bundle config build.eventmachine --with-cppflags=-I$(brew --prefix openssl)/include
```
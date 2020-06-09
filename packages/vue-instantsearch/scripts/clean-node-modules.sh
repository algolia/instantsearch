#!/bin/sh

# we have something weird going on, where installing via `file:../..` doesn't take "files" in account, and thus copies recursively. This causes cache to take many minutes and us to time-out. The long-term solution is to use prevent the recursive copying too, which will make the install faster.

mkdir /tmp/empty

rsync -a --delete /tmp/empty node_modules
rsync -a --delete /tmp/empty examples/default-theme/node_modules
rsync -a --delete /tmp/empty examples/e-commerce/node_modules
rsync -a --delete /tmp/empty examples/media/node_modules
rsync -a --delete /tmp/empty examples/nuxt/node_modules
rsync -a --delete /tmp/empty examples/ssr/node_modules

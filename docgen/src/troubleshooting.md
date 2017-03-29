---
title: Troubleshooting
layout: main.pug
name: troubleshooting
category: main
withHeadings: true
navWeight: 0
---


There are a few errors that you may encounter if your setup is not correct. 
Here are the frequent errors and the appropriate solutions:

## No resource type specified
> Error:(42, 42) **No resource type specified** (at 'attribute' with value '@{"image"}’).

  Either you forgot to [enable the DataBinding Library](#data-binding) or your `itemLayout` does not start with a `<layout>` root tag.

## NoClassDefFoundError
> **java.lang.NoClassDefFoundError: Failed resolution of: Landroid/databinding/DataBinderMapper;**
    at android.databinding.DataBindingUtil.<clinit>(DataBindingUtil.java:31)  

  You forgot to [enable the DataBinding Library](#data-binding).

## Only one layout element
> **Error:Only one layout element and one data element are allowed.** */path/to/your/app/build/intermediates/res/merged/debug/layout/hits_item.xml* has 2 

Your `<layout>` should have only one child: put all current children in a single `<ViewGroup>`.

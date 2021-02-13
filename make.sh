#!/usr/bin/env bash

for i in Parte*.tex ; do latexmk -shell-escape -pdf "$i"; done

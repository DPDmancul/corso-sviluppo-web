for i in Lezione*.tex ; do latexmk -shell-escape -pdf "$i"; done
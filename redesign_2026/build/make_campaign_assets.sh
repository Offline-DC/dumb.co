#!/bin/sh
# How assets/campaign-*.jpg were made: page 1 of the "carl flyer" PDFs in
# ../dumb.co/design-assets_dontpush/new brand elements, rasterised and trimmed
# of the PDF's white page margin. Needs poppler-utils + imagemagick.
SRC="../dumb.co/design-assets_dontpush/new brand elements"
set -e
for pair in "1:campaign-dumb-effect" "3:campaign-so-many-smart-people" "4:campaign-what-a-duck-has-to-do"; do
  n=${pair%%:*}; out=${pair##*:}
  pdftoppm -jpeg -r 60 -f 1 -l 1 -jpegopt quality=78 "$SRC/carl flyer $n.pdf" "/tmp/carl$n"
  convert "/tmp/carl$n-1.jpg" -fuzz 4% -trim +repage -resize 760x -quality 76 "../assets/$out.jpg"
done
echo "wrote assets/campaign-*.jpg"

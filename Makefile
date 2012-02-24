VERSION = `cat package.json | grep version | grep -o '[0-9]\.[0-9]\.[0-9]\+'`
SRC = src/jquery.socialfeed.js
DIST = dist/jquery-socialfeed-${VERSION}.js
DIST_MIN = dist/jquery-socialfeed-${VERSION}.min.js

social:
	@@mkdir -p dist
	@@touch ${DIST}
	@@cat ${SRC} | sed s/@VERSION/${VERSION}/ > ${DIST}	
	@@echo ${DIST} built.

dist: social
	@@echo minifying...
	@@java -jar build/yuicompressor-2.4.7.jar ${DIST} -o ${DIST_MIN}
	@@echo ${DIST_MIN} built.



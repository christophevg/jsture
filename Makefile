APP         = jsture

SRC_DIR   = src
LIB_DIR   = lib
BUILD_DIR = build
DIST_DIR  = dist

SRCS = ${LIB_DIR}/ProtoJS/build/ProtoJS.js \
			 ${SRC_DIR}/jsture.js \
			 ${SRC_DIR}/Watcher.js \
			 ${SRC_DIR}/Pattern.js \
			 ${SRC_DIR}/Element.js \
			 ${SRC_DIR}/Display.js

TARGETS=${BUILD_DIR}/${APP}.min.js

MAKE      = make
ZIP       = zip -qr

RHINO     = java -jar lib/ProtoJS/lib/js.jar
JSEXEC    = ${RHINO} -w -debug
COMPRESS  = java -jar lib/ProtoJS/lib/yuicompressor-2.4.2.jar --type js

VERSION = $(shell git describe --tags | cut -d'-' -f1,2)

all: prepare ${TARGETS}

prepare: init check-deps

init:
	@git submodule init
	@git submodule update

check-deps:
	@which java >/dev/null || ( echo "ERROR: missing : java"; exit 1 )

${BUILD_DIR}:
	@mkdir  -p ${BUILD_DIR}

${BUILD_DIR}/${APP}.js: ${BUILD_DIR} ${SHARED_SRCS}
	@echo "*** building $@"
	@cat ${SRCS} > $@
	@echo "\n${APP}.version = \"${VERSION}\";\n" >> $@;

%.min.js: %.js
	@echo "*** building $@"
	@${COMPRESS} $< > $@

test: clean ${BUILD_DIR}/${APP}.min.js
	@echo "*** running tests"
	@${JSEXEC} -opt -1 -f t/runAllTests.js

clean:
	@find . | grep "~$$" | xargs rm -f
	@rm -rf ${BUILD_DIR}

mrproper: clean
	@rm -rf ${DIST_DIR}

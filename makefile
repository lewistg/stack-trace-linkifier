DIST=dist
CONTENT=content

extension: $(DIST)/.extension

$(DIST)/.extension: content_script icons background.js devtools.js devtools.html manifest.json 
	cp $(wordlist 3, $(words $^), $^) $(DIST)
	touch $@

content_script: $(DIST)/content_script.js
$(DIST)/content_script.js: $(CONTENT)/*
	rollup $(CONTENT)/main.js --output.format iife --output.file $@

icons: $(DIST)/icons
$(DIST)/icons: icon.svg
	mkdir -p $@; \
	for size in 16 32 48 128; do \
		inkscape -z -e "$@/$$(basename $< .svg)$$size.png" -w $$size -h $$size $<; \
	done

PACKAGE=stack-trace-linkifier.zip
package: stack-trace-linkifier.zip
$(PACKAGE): extension
	cd $(DIST); \
	zip -r $@ . -x .*; \
	mv $@ ..

clean-package: 
	rm -rf $(PACKAGE)

.PHONY: clean
clean: clean-package
	find dist -mindepth 1 -maxdepth 1 -exec test {} != "dist/.gitignore" \; -and -exec rm -rf {} \;

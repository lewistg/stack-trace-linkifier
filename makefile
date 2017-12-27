DIST=dist
CONTENT=content

extension: $(DIST)/.extension

$(DIST)/.extension: $(DIST)/content_script.js background.js devtools.js devtools.html manifest.json icon32.png
	cp $(wordlist 2, 6, $^) $(DIST)
	touch $@

$(DIST)/content_script.js: $(CONTENT)/main.js
	rollup $< --output.format iife --output.file $@

.PHONY: clean
clean:
	rm -rf $(DIST)/*

REPORTER ?= dot

test: test-unit

test-unit:
	@mocha \
		--reporter $(REPORTER) \
		tests/*.js \
		--growl \
		tests/*.js
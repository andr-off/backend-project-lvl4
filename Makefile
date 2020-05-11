install:
	npm install

start:
	NODE_ENV=development DEBUG=application:* npx nodemon --watch . --exec npx gulp server

publish:
	npm publish --dry-run

lint:
	npx eslint .

build:
	rm -rf dist
	npm run build

devbuild:
	rm -rf dist
	npm run devbuild

test:
	npm test

test-coverage:
	npm test -- --coverage

.PHONY: test

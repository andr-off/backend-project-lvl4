install:
	npm install

start:
	NODE_ENV=development DEBUG=app:* npx nodemon --watch . --exec npx gulp server

publish:
	npm publish --dry-run

lint:
	npx eslint .

build:
	npm run build

test:
	npm test

deploy:
	git push heroku master
	heroku run "npx sequelize db:migrate"

db-setup:
	npx sequelize db:migrate

setup:
	install db-setup

test-coverage:
	npm test -- --coverage

.PHONY: test

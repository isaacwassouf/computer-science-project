# Computer Science Project - Implementation of an OpenID Connect Rely Party

This is the final submission for the **Project: Software Engineering (DLMCSPSE01)** course.

# Installation

In order to install the project successfully please follow the following steps.


- If not already installed, install [pnpm](https://pnpm.io/installation)

- Create the ```.env``` file for the PWA
	```bash
	cp .env.template .env
	```
- Set the ```CLIENT_ID``` and ```CLIENT_SECRET``` values mentioned in the project report to the varibales in the ```.env``` file
- Run the database docker container
	```bash
	docker compose up -d
	```
- Run the database migrations
	```bash
	pnpm drizzle-migrate
	```
- Run the database migrations
	```bash
	pnpm drizzle-migrate
	```
- Run the SvelkteKit application
	```bash
	pnpm dev
	```
 - Navigate to [http://localhost:5173/auth](http://localhost:5173/auth) to test the authentication process

# HexaCardsAPI

An API for a game I'm making (or was).

Node.js, Express, RethinkDB, and Typescript, yahoo!

Feel free to learn.

## To setup:

`npm install`

## To run:

`npm start` or `tsc && node dist/server.js`, if you have `typescript` installed globally

## How to test:

`POST 127.0.0.1:8079/api/users/register`

Body: (application/json):
```json
{
	"id": "",
	"username": "johntest",
	"password": "asdf"
}
```

**Then, to log in:**

`POST 127.0.0.1:8079/api/users/login`

Headers: `Authorization: Basic johntest:asdf`
- Should return a token

**Then, to test the token:**

`GET 127.0.0.1:8079/api/users/self`

Headers: `Authorization: Bearer <your-token-here>`

- It should return
```json
{
  "id": "your-id-here",
  "username": "johntest"
}
```

---

There are also other GET's for `/api/teams` and `/api/teams/id` which are open without a
token. To `post` or `put` a team, you have to be authenticated (i.e. use at token).

## Enjoy!

*<sup>soli deo gloria</sup>*

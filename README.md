# Merkle-Patricia DB server

Interface with a [merkle-patricia-tree](https://github.com/wanderer/merkle-patricia-tree) backed by [LevelDB](https://github.com/level/level).
Use this if you want a merkle-patricia-tree backed by a remote db w/o causing a lot of network spam.

Read is unauthenticated and write authenticated. Creating API keys requires the `ADMIN_KEY`.


### Unauthenticated API

##### get value for key at root
returns value for key at the specified root, in hex. 


### Authenticated API

##### pipe whole tree at root
`curl localhost:7000/root/?access_token=your_access_token||your_admin_key`
returns the output of a readstream of the merkle-patricia-tree generated from the specified root.

##### update value at key for root, get new root
`curl -d "value=deadbeef" -d "access_token=your_access_token||your_admin_key" localhost:7000/root/key`
returns the new state root.

##### generate access_token
`curl -d "access_token=your_admin_key" localhost:7000/access_token`
returns a new access_token.

### Run
Set the `PORT` (default is 7000) and the `ADMIN_KEY` (required) environment variables.
The `ADMIN_KEY` can be any non-empty string.

```bash
PORT=7000 ADMIN_KEY="1234567890" npm start
```

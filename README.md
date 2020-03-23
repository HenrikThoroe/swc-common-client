# swc-common-client

## Installation
1. Clone this repository
2. Install Node.js and NPM if not already done [https://nodejs.org]
3. Open a shell inside the cloned repository
4. Run `npm install`

## Usage
To run this repository simply run the following script. The client will automatically connect with the **running** game server on localhost:13050
```
npm start
```
To use different port and address run
```
npm build
node ./dist/bundle.js --port myPort --host myHost --reservation myReservation
```

---

To build and archive the repository run the following script.
The compiled and bundled program will be packed in `./archive/player.zip`.
```
npm run bundle
```

---

To only build the program run the following script. You can find the compiled program under `./dist`.
```
npm run build
```

## Description
The swc-common-client is a client for the software challenge by CAU Kiel written in TypeScript. It uses the swc-client by Henrik Thoroe to communicate with the game server and to fetch the game state. 

## Contributing
For now contributing to this repository is restricted to my team which includes me [HenrikThoroe] and OGunter.

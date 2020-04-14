# swc-common-client

## Installation
1. Clone this repository
2. Install Node.js and NPM if not already done [https://nodejs.org]
3. Open a shell inside the cloned repository
4. Run `npm install`

## Usage

### Run Application

#### Default Settings
- Port: 13050
- Host: localhost
- Reservation Code: None
- Production: False
- Simple Client: False
```
npm start
```

#### Custom Settings
```sh
npm start -- --port myPort --host myHost --reservation myReservation --production --stupid
# or with shorthands
npm start -- -p myPort -h myHost -r myReservation --production -s
```

### Bundle / Prepare for Upload

The compiled and bundled program will be packed in `./archive/player.zip`.
```
npm run bundle
```

### Build

You can find the compiled program in `./dist`.
```
npm run build
```

### Export 
- destination (required): Path to output directory. The script will create a subdirectory containing the application like the bundled version but not zipped
- tag (optional): A custom tag to identify the export.
    - Default name: swc-player
    - With Tag: swc-player-mytag
- force (optional): Flag whether an existing export at the passed destination should be overwritten.
```sh
npm run export -- --destination /path/to/directory --tag mySpecialTag --force
# or with shorthands
npm run export -- -d /path/to/directory -t mySpecialTag -f
```

## Description
The swc-common-client is a client for the software challenge by CAU Kiel written in TypeScript. It uses the swc-client by Henrik Thoroe to communicate with the game server and to fetch the game state. 

## Contributing
For now contributing to this repository is restricted to my team which includes me [HenrikThoroe] and OGunter.

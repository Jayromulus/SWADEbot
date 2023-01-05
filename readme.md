# SWADEBOT

SWADEbot is a bot made using [discord.js](https://discord.js.org/#/) that has multiple tools helpful for referencing information and making rolls for the Savage Worlds system and affiliated works.

## Installation

Clone the project and use the [discord.js starter guide](https://discordjs.guide/#before-you-begin) to create your own bot, then create a .env file with some variables in it used throughout the bot. This project does not use a config.json file, the documentation does but any such variables required are instead placed in the .env file

```bash
git clone https://github.com/Jayromulus/SWADEbot.git
npm i
```
## .env
| Name | Value |
| --- | ---- |
| TOKEN | bot token generated on initial creation in the discord dev portal |
| CLIENT | this is the application id you can find in the application information |
| GUILD | server id where you will be using the commands, mostly useful for adding/deleting commands |
| IMAGE | this is the image that appears in the footer of the embeds, to be removed when a better solution is found |

## Usage
| Command Syntax | Explanation |
| - | - |
 | ![ouch](https://github.com/Jayromulus/SWADEbot/blob/slash/assets/ouch.png?raw=true) | returns the damage recieved by a player, both toughness and damage are number inputs for the user, this will not |
 | ![potion](https://github.com/Jayromulus/SWADEbot/blob/slash/assets/potion.png?raw=true) | calculates the price of a potion given a rank (as chosen from a list), the cost of the effect, and the strength of the potion |
 | ![roll](https://github.com/Jayromulus/SWADEbot/blob/slash/assets/roll.png?raw=true) | rolls dice following a format of `#d#(+/-#)` where the +/- section is optional. the first set is required while the second is optional, and an error will be send should the formatting be incorrect |
 | ![scroll](https://github.com/Jayromulus/SWADEbot/blob/slash/assets/scroll.png?raw=true) | calculates the price of a scroll with a given rank's inscription using the provided cost of the enchantment |
 | ![trait](https://github.com/Jayromulus/SWADEbot/blob/slash/assets/trait.png?raw=true) | rolls a trait roll given a number size of the player's trait die, with an option to add a bonus as well as an option to edit the wild die size (default is 6) |
 | ![wand](https://github.com/Jayromulus/SWADEbot/blob/slash/assets/wand.png?raw=true) | calculates the price of a wand with a given rank's spell of the provided cost with a number of charges in it |
 | ![weapon](https://github.com/Jayromulus/SWADEbot/blob/slash/assets/weapon.png?raw=true) | sends an embed holding information about the selected weapon, as written in by autofill |
 
## Contributing
Currently only accepting requests from the group this was made for, though there may become open requests in the future should there be a large enough support for this project to warrant such a time commitment.

## License

[MIT](https://choosealicense.com/licenses/mit/)
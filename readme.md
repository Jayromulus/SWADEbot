# SWADEbot
> Discord bot for Savage Worlds utilities

SWADEbot is a bot made using [discord.js](https://discord.js.org/#/) that has multiple tools helpful for referencing information and making rolls for the Savage Worlds system and affiliated works.

## Installation

Clone the project and use the [discord.js starter guide](https://discordjs.guide/#before-you-begin) to create your own bot, then create a .env file with some variables in it used throughout the bot. This project does not use a config.json file, the documentation does but any such variables required are instead placed in the .env file

```bash
git clone https://github.com/Jayromulus/SWADEbot.git
npm i
npm start
```
## .env
| Name | Value |
| --- | ---- |
| TOKEN | bot token generated on initial creation in the discord dev portal |
| CLIENT | this is the application id you can find in the application information |
| GUILD | server id where you will be using the commands, mostly useful for adding/deleting commands |
| IMAGE | this is the image that appears in the footer of the embeds, to be removed when a better solution is found |

## Usage
<table>
    <tr>
        <th>Command</th>
        <th>Arguments</th>
        <th>Explanation</th>
    </tr>
    <tr>
        <td>/ouch</td>
        <td>
            <table>
                <tr>
                    <td>toughness</td>
                    <td>Number</td>
                </tr>
                <tr>
                    <td>damage</td>
                    <td>Number</td>
                </tr>
            </table>
        </td>
        <td>returns the damage recieved by a player, both toughness and damage are number inputs for the user, this will not</td>
    </tr>
    <tr>
        <td>/potion</td>
        <td>
            <table>
                <tr>
                    <td>rank</td>
                    <td>String</td>
                </tr>
                <tr>
                    <td>cost</td>
                    <td>Number</td>
                </tr>
                <tr>
                    <td>strength</td>
                    <td>String</td>
                </tr>
            </table>
        </td>
        <td>calculates the price of a potion given a rank (as chosen from a list), the cost of the effect, and the strength of the potion</td>
    </tr>
    <tr>
        <td>/roll</td>
        <td>
            <table>
                <tr>
                    <td>sets</td>
                    <td>String</td>
                </tr>
            </table>
        </td>
        <td>rolls dice following a format of `#d#(+/-#)` where the +/- section is optional. the first set is required while the second is optional, and an error will be send should the formatting be incorrect</td>
    </tr>
    <tr>
        <td>/scroll</td>
        <td>
            <table>
                <tr>
                    <td>rank</td>
                    <td>String</td>
                </tr>
                <tr>
                    <td>cost</td>
                    <td>Number</td>
                </tr>
            </table>
        </td>
        <td>calculates the price of a scroll with a given rank's inscription using the provided cost of the enchantment</td>
    </tr>
    <tr>
        <td>/wand</td>
        <td>
            <table>
                <tr>
                    <td>rank</td>
                    <td>String</td>
                </tr>
                <tr>
                    <td>cost</td>
                    <td>Number</td>
                </tr>
                <tr>
                    <td>charges</td>
                    <td>Number</td>
                </tr>
            </table>
        </td>
        <td>calculates the price of a wand with a given rank's spell of the provided cost with a number of charges in it</td>
    </tr>
    <tr>
        <td>/weapon</td>
        <td>
            <table>
                <tr>
                    <td>name</td>
                    <td>String</td>
                </tr>
            </table>
        </td>
        <td>sends an embed holding information about the selected weapon, as written in by autofill</td>
    </tr>
</table>

## Contributing
Currently only accepting requests from the group this was made for, though there may become open requests in the future should there be a large enough support for this project to warrant such a time commitment.

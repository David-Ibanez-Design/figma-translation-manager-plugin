# Translation Manager Figma Plugin

![alt text](https://github.com/David-Ibanez-Design/figma-translation-manager-plugin/blob/main/preview.png?raw=true)

The translation manager is a Figma plugin designed specifically to efficiently manage design translations directly within Figma. This plugin allows users to match terms used in the design file to existing translations stored in `JSON` files, add or edit new translations, and generate a translation table for easy reference.

## Features

- Match terms used in the design file to existing translations stored in `JSON` files.
- Add or edit new translations for terms present in the design.
- Output a translation table containing all translated terms.
- Allow users to navigate to a translated term from the plugin popup or the translation table.
- Stored translation terms in local variables

## How It Works

The translation manager plugin operates based on specific conventions within Figma layer names. Here's how the plugin interprets different layer name patterns:

- Text in the design file with a layer name matching the string: `T:Null` will be displayed in the plugin popup as not translated.
- Text in the design file with a layer name matching the string: `T:[dictionary name]->[English term]` will be displayed in the plugin popup as matched to the corresponding translation.
- Text in the design file with a layer name matching the string: `T:Manual->[translation]` will be displayed in the plugin popup as matched to a new manual translation.

Once displayed in the plugin popup, users can match the term to an existing translation. The translation table will be automatically generated on a new page named "Translations" if the page does not exist yet.

## Limitations

- This plugins require an organization-level Figma plan, you must download the Figma desktop application and import the plugin folder manually to use it.
- The translation table should not be directly modified. Instead, please use the plugin or rename the layers directly in the design.
- Figma plugins cannot run in the background, and there is currently no functionality to listen for changes. If a layer name is modified, the plugin will need to be re-run to reflect the changes in the plugin popup.
- You should only use Frames in your design and not groups

## Getting Started

To use the translation manager plugin, follow these steps:

1. Download the Figma desktop application from the official Figma website.
2. Import the plugin folder manually into Figma by navigating to the "Plugins" section and selecting "Create new plugin." Choose the option to import the plugin folder.
3. Once imported, you can access the plugin within Figma and start managing your design translations efficiently.

Additionally you can use the provided `Figma-translation-manager-sample-file` to test this plugin. The file is stored in `./design-sample-file/` .
import { FONT_BOLD, COLUMNS, displayTime, TRANSLATION_PAGE_NAME } from '../globalConst';
import { loadFonts, setValues, rgbColorConverter, setLayoutStroke, getNodes, getNodeById, isObjectEmpty } from '../helpers';

function setLayout(frame, layoutMode, layoutGrow = false || 0 || 1, layoutAlign = "INHERIT" , counterAxisSizingMode = "AUTO", primaryAxisSizingMode = "AUTO"){
    frame.layoutMode = layoutMode;
    if(layoutGrow) {frame.layoutGrow = layoutGrow}
    frame.layoutAlign = layoutAlign;
    frame.counterAxisSizingMode = counterAxisSizingMode;
    frame.primaryAxisSizingMode = primaryAxisSizingMode;
}

function generateColumns(dataToCopy, tableFrame){

    COLUMNS.forEach(element => {

        const clonedCol = dataToCopy.clone();
        clonedCol.name = element;
        clonedCol.children[0].children[0].characters = element;

        tableFrame.appendChild(clonedCol);

        if(element === "Term" || element === "JP term"){
            clonedCol.resize(500, 100);
            setLayout(clonedCol, 'VERTICAL', 0, "INHERIT", "FIXED", "AUTO");
        }

    });     
}

function generateRows(tableFrame, dataToCopy, dataToRender){

    dataToRender.forEach((data) => {
        COLUMNS.forEach(element => {
            const clonedCell = dataToCopy.clone();
            clonedCell.name = "Cell";
          
            const node = tableFrame.findOne(node => node.name === element);
            node.appendChild(clonedCell);
            setValues(loadFonts, element, data, clonedCell);

            if(element === "Term" || element === "JP term"){
                clonedCell.children[0].layoutAlign = 'STRETCH';
                clonedCell.children[0].layoutGrow = 0;
                clonedCell.children[0].textAutoResize =  "TRUNCATE";
                clonedCell.children[0].layoutGrow = 1
                clonedCell.children[0].layoutAlign = "STRETCH";
            }else{
                clonedCell.children[0].textAutoResize =  "WIDTH_AND_HEIGHT";
                clonedCell.counterAxisSizingMode = "AUTO";
                clonedCell.layoutAlign = "STRETCH"
            }
        });  

    })

}

// Need to find a way to merge that with the generateRows but the issue is the data structure is different (array vs single object)
function removeTemplates(tableFrame){

    const tableNodes = tableFrame.findAllWithCriteria({types: ['FRAME']});
    
    for (const node of tableNodes) { node.name === "Cell template" && node.remove(); }
    for (const node of tableNodes) {node.name === "Term template" && node.remove();}

}

function storePageAndTableIds(tableFrame){

    // Clear storage
    figma.root.setPluginData("Translation table ID", "");

    // Store new table ID
    figma.root.setPluginData("Translation table ID", JSON.stringify(tableFrame.id));

    // Generate and store page ID
    const getTranslationPage = !isObjectEmpty(figma.root.getPluginData("Translation page ID")) && JSON.parse(figma.root.getPluginData("Translation page ID"));
    const getTranslationPageNode = getTranslationPage ? getNodeById(getTranslationPage): false;

    if(!getTranslationPageNode) {
        // clear storage
        getTranslationPage &&  figma.root.setPluginData("Translation page ID", "");
        const translationsPage = figma.createPage();
        translationsPage.appendChild(tableFrame);
        translationsPage.name = TRANSLATION_PAGE_NAME;
        figma.root.setPluginData("Translation page ID", JSON.stringify(translationsPage.id));

    }else{  
        getTranslationPageNode.appendChild(tableFrame);
    }
}

export function generateTansTable(dataToRender){
    // Load the fonts by running the function
    loadFonts().then(() => {
       
        // Setting global structure
        const tableFrame = figma.createFrame();
        const colFrame = figma.createFrame();
        const headerFrame = figma.createFrame();
        const cellFrame = figma.createFrame(); 

        // Append elements
        tableFrame.appendChild(colFrame);
        colFrame.appendChild(headerFrame);
        colFrame.appendChild(cellFrame);

        // Store page and table IDs
        storePageAndTableIds(tableFrame);

        // Setting frames
        tableFrame.name = "Translation table";
        headerFrame.name = "Header"; 
        colFrame.name = "Term template";
        cellFrame.name = "Cell template";   
        
        //Appending text
        const colText = figma.createText();
        const headerText = figma.createText();
        cellFrame.appendChild(colText);
        headerFrame.appendChild(headerText);
 
        // Visibility
        tableFrame.locked= true;

        // Setting spacing
        headerFrame.itemSpacing = 4;
        cellFrame.itemSpacing = 4;

        // Setting padding
        headerFrame.verticalPadding = 16;
        headerFrame.horizontalPadding = 16;
        headerFrame.strokes = setLayoutStroke();
        headerFrame.strokeBottomWeight = 1;

        cellFrame.verticalPadding = 16;
        cellFrame.horizontalPadding = 16;
        cellFrame.strokes = setLayoutStroke();
        cellFrame.strokeBottomWeight = 1;


        // Convert hexadecimal color to RGB color object
        headerFrame.fills = [{type: 'SOLID', color: rgbColorConverter('F9FBFC')}];

        // cell text
        colText.name =  "cell name";
        colText.fontSize =  14;
        colText.characters =  "cell";
        
        // Header text
        headerText.name =  "Header name";
        headerText.fontSize =  14;
        headerText.fontName =  FONT_BOLD;
        headerText.characters =  "Term";
        headerText.textAutoResize =  "WIDTH_AND_HEIGHT";

        // Setting layout
        setLayout(tableFrame, 'HORIZONTAL', 0 ,"STRETCH", "AUTO", "AUTO");
        setLayout(colFrame, 'VERTICAL', 0, "STRETCH", "AUTO", "AUTO");
        setLayout(headerFrame, 'VERTICAL', 0, "STRETCH", "AUTO");
        setLayout(cellFrame, 'VERTICAL', 0, "INHERIT", "AUTO", "AUTO");
        cellFrame.resize(500, 90);
       
        //Generate cols
        generateColumns(colFrame, tableFrame);
        generateRows(tableFrame, cellFrame, dataToRender);

        //Delete frames and layers
        removeTemplates(tableFrame);
    })

    figma.notify('Translation table generated', {timeout: displayTime, error: false});

}

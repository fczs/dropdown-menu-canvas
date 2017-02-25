var input = document.getElementsByTagName('input'),
    table = document.getElementById('table'),
    ctx = table.getContext('2d'),
    areaMatrix = drawTable(), //array for clickable area coordinates
    menuOpen = false;

//re-draw table on input change
for (var i = 0; i < input.length; i++) {
    input[i].addEventListener('input', function () {
        areaMatrix = drawTable();
        menuOpen = false;
    });
}

//find clicked area and call worker
table.onclick = function(e) {
    var clickedArea = intersection(areaMatrix, e.offsetX, e.offsetY);
    if (clickedArea) {
        clickedArea = clickedArea.split(':');
        //show dropdown on header click
        if (clickedArea[0] == 'header') {
            if (menuOpen === true) {
                areaMatrix = drawTable();
            }
            //draw menu and add menu items to clickable area
            areaMatrix = areaMatrix.concat(drawMenu(clickedArea[1]));
            menuOpen = true;
        //show dialog on item click
        } else if (clickedArea[0] == 'menuItem') {
            areaMatrix = drawTable(function() {
                drawPopup('Item ' + clickedArea[1] + ' is clicked');
            });
        }
    } else {
        areaMatrix = drawTable();
    }
};

//draws table and returns headers coordinates
function drawTable(callback) {
    var n = document.getElementById('n'),
        k = document.getElementById('k'),
        rows = n.value,
        columns = k.value,
        width = columns * 50,
        height = rows * 30,
        widthMargin = (columns < 3) ? 200 - width : 72, //set minimum width 200px
        heightMargin = (rows < 5) ? 150 - height : 0, //set minimum height 150px
        headerMatrix = [], //array for col headers coordinates
        shift; //shift cursor to get a single pixel line

    //add 4px to draw table border with 2px thickness
    table.width = width + 4 + widthMargin;
    //add 4px to draw table border with 2px thickness
    table.height = height + 4 + heightMargin;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width + 2, height + 2);

    for (var iCol = 1; iCol <= columns; iCol++) {
        for (var iRow = 1; iRow <= rows; iRow++) {
            if (iRow == 1) {
                var strCol = iCol.toString(),
                    pos = iCol * 50 - 22 - 5 * strCol.length; //calculate col header position
                ctx.lineWidth = 2;
                shift = 2;
                //write column title
                ctx.font = 'bold 16px courier';
                ctx.textBaseline = 'top';
                ctx.fillText(strCol, pos, 10);
                //add header cell coordinates to array
                headerMatrix.push({item: 'header:' + iCol, x: (iCol - 1) * 50 + shift, y: 2, w: 49, h: 29})
            } else {
                shift = 2.5;
                ctx.lineWidth = 1;
            }
            //horizontal lines for row borders
            if (iRow != rows) {
                ctx.beginPath();
                ctx.moveTo(2, iRow * 30 + shift);
                ctx.lineTo(width + 2, iRow * 30 + shift);
                ctx.stroke();
            }
            //vertical lines for cell borders
            if (iCol != columns) {
                ctx.beginPath();
                ctx.moveTo(iCol * 50 + shift, (iRow - 1) * 30 + 2);
                ctx.lineTo(iCol * 50 + shift, iRow * 30 + 2);
                ctx.stroke();
            }
        }
    }
    if (callback) {
        callback();
    }
    return headerMatrix;
}

//Draws dropdown menu for specified header and returns items coordinates
function drawMenu(headerNum) {
    var titlePos = 84 / 2 - 5 * headerNum.toString().length, //calculate menu title position
        menuItemsNum = (headerNum % 2 == 0) ? 2 : 3, //number of menu items: 2 for even, 3 for odd
        menuPosX = headerNum * 50 - 10,
        menuPosY = 30,
        itemsMatrix = [];

    //menu shadow
    ctx.fillStyle = 'rgba(0, 0, 0, .15)';
    ctx.fillRect(menuPosX + 3, menuPosY + 3, 84, (menuItemsNum + 1) * 30);
    //menu arrow
    ctx.beginPath();
    ctx.moveTo(menuPosX, menuPosY);
    ctx.lineTo(menuPosX + 5, menuPosY - 5);
    ctx.lineTo(menuPosX + 10, menuPosY);
    ctx.lineTo(menuPosX, menuPosY);
    ctx.fillStyle = '#eee';
    ctx.fill();
    //menu body
    ctx.fillRect(menuPosX, menuPosY, 84, (menuItemsNum + 1) * 30);
    //menu title
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px courier';
    ctx.textBaseline = 'top';
    ctx.fillText(headerNum, menuPosX + titlePos, menuPosY + 8);
    //add menu title coordinates to array
    itemsMatrix.push({item: 'menuTitle', x: menuPosX, y: menuPosY, w: 84, h: 30});
    //menu items
    for (var i = 1; i <= menuItemsNum; i++) {
        //item separator
        ctx.strokeStyle = '#bbb';
        ctx.beginPath();
        ctx.moveTo(menuPosX + 5, menuPosY + i * 30 + .5);
        ctx.lineTo(menuPosX + 79, menuPosY + i * 30 + .5);
        ctx.stroke();
        //item
        ctx.fillStyle = '#000';
        ctx.fillText("Menu " + i, menuPosX + 8, menuPosY + 8 + i * 30);
        //add item coordinates to array
        itemsMatrix.push({item: 'menuItem:' + i, x: menuPosX, y: menuPosY + i * 30, w: 84, h: 30});
    }
    return itemsMatrix;
}

//Draws dialog with # of menu item
function drawPopup(item) {
    var popupWidth = 200,
        popupHeight = 100,
        popupMargin = (table.width < 276) ? 0 : 72,
        popupPosX = (table.width - popupMargin) / 2 - 100,
        popupPosY = 30;

    //popup shadow
    ctx.fillStyle = 'rgba(0, 0, 0, .15)';
    ctx.fillRect(popupPosX + 3, popupPosY + 3, popupWidth, popupHeight);
    //popup body
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ddd';
    ctx.strokeRect(popupPosX, popupPosY, popupWidth, popupHeight);
    ctx.fillStyle = '#fff';
    ctx.fillRect(popupPosX + 1, popupPosY + 1, popupWidth - 2, popupHeight - 2);
    //popup main message
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px courier';
    ctx.textBaseline = 'top';
    ctx.fillText(item, popupPosX + 14, popupPosY + 40);
    //popup close message
    ctx.font = 'normal 11px courier';
    ctx.fillText('click to close', popupPosX + 51, popupPosY + 82);
}

//finds area where intersection occurred
function intersection(area, x, y) {
    var intersectionArea = false;
    for (var i = 0; i < area.length; i++) {
        var left = area[i].x,
            right = area[i].x + area[i].w,
            top = area[i].y,
            bottom = area[i].y + area[i].h;
        if (right >= x && left <= x && bottom >= y && top <= y) {
            intersectionArea = area[i].item;
        }
    }
    return intersectionArea;
}
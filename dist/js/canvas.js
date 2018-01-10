(function (document) {

    function TableMenu () {
        /**
         * @type {Element}
         */
        this.table = document.getElementById('table');

        /**
          * @type {*}
         */
        this.ctx = this.table.getContext('2d');

        /**
         * Clickable area coordinates
         * @type {Array}
         */
        this.areaMatrix = [];

        /**
         * @type {boolean}
         */
        this.menuOpened = false;
    }

    TableMenu.prototype.init = function () {
        this.areaMatrix = this.drawTable();
        this.resize();
        this.events();
    };

    /**
     * Adds event listener for table resize.
     */
    TableMenu.prototype.resize = function () {
        var input = document.getElementsByTagName('input');

        // re-draw table on input change
        for (var i = 0; i < input.length; i++) {
            input[i].addEventListener('input', function () {
                this.areaMatrix = this.drawTable();
            }.bind(this));
        }
    };

    /**
     * Finds clicked area and calls for workers.
     */
    TableMenu.prototype.events = function () {
        this.table.onclick = function (e) {
            var clickedArea = this.intersection(e.offsetX, e.offsetY);

            // re-draw empty table and return if clicked area is empty
            // or return without re-drawing if menu title was clicked
            if (Object.keys(clickedArea).length === 0) {
                this.areaMatrix = this.drawTable();
                return;
            } else if (clickedArea.itemType === 'menu' && clickedArea.itemNum === 0) {
                return;
            }

            this.areaMatrix = this.drawTable();

            // show dropdown on header click
            if (clickedArea.itemType === 'header') {
                // draw menu and add menu items to the clickable area
                this.areaMatrix = this.areaMatrix.concat(this.drawMenu(clickedArea.itemNum));
            // show dialog on item click
            } else if (clickedArea.itemType === 'menu') {
                this.drawPopup('Item ' + clickedArea.itemNum + ' is clicked');
            }

        }.bind(this);
    };

    /**
     * Draws table and returns headers coordinates.
     * @returns {Array}
     */
    TableMenu.prototype.drawTable = function () {
        var ctx = this.ctx,
            n = document.getElementById('n'),
            k = document.getElementById('k'),
            rows = n.value,
            columns = k.value,
            colWidth = 50,
            rowHeight = 30,
            tableMarginRight = 72,
            width = columns * colWidth,
            height = rows * rowHeight,
            widthMargin = (columns < 3) ? 200 - width : tableMarginRight, // minimum width 200px
            heightMargin = (rows < 5) ? 150 - height : 0, // minimum height 150px
            headerMatrix = [], // col headers coordinates
            thickLine = 2, // 2px line
            thinLine = 1, // 1px line
            shift; // shift cursor to get a single pixel line

        // add 4px to draw table border with 2px thickness
        this.table.width = width + thickLine * 2 + widthMargin;

        // add 4px to draw table border with 2px thickness
        this.table.height = height + thickLine * 2 + heightMargin;
        ctx.lineWidth = thickLine;
        ctx.strokeRect(1, 1, width + thickLine, height + thickLine);

        for (var iCol = 1; iCol <= columns; iCol++) {
            for (var iRow = 1; iRow <= rows; iRow++) {
                if (iRow === 1) {
                    var strCol = iCol.toString(),
                        shiftColHeaderPos = 22,
                        pos = iCol * colWidth - strCol.length * 5 - shiftColHeaderPos; // calculate col header position
                    ctx.lineWidth = thickLine;
                    shift = 2;

                    // write column title
                    ctx.font = 'bold 16px courier';
                    ctx.textBaseline = 'top';
                    ctx.fillText(strCol, pos, 10);

                    // add header cell coordinates to array
                    headerMatrix.push({
                        itemType: 'header',
                        itemNum: iCol,
                        x: (iCol - 1) * colWidth + shift,
                        y: thickLine,
                        w: colWidth - 1,
                        h: rowHeight - 1
                    });
                } else {
                    shift = 2.5;
                    ctx.lineWidth = thinLine;
                }

                // horizontal lines for row borders
                if (iRow !== rows) {
                    ctx.beginPath();
                    ctx.moveTo(2, iRow * rowHeight + shift);
                    ctx.lineTo(width + 2, iRow * rowHeight + shift);
                    ctx.stroke();
                }

                // vertical lines for cell borders
                if (iCol !== columns) {
                    ctx.beginPath();
                    ctx.moveTo(iCol * colWidth + shift, (iRow - 1) * rowHeight + 2);
                    ctx.lineTo(iCol * colWidth + shift, iRow * rowHeight + 2);
                    ctx.stroke();
                }
            }
        }

        if (this.menuOpened)
            this.menuOpened = false;

        return headerMatrix;
    };

    /**
     * Draws dropdown menu for the specified header and returns items coordinates.
     * @param headerNum
     * @returns {Array}
     */
    TableMenu.prototype.drawMenu = function (headerNum) {
        var ctx = this.ctx,
            menuWidth = 84,
            titlePos = menuWidth / 2 - 5 * headerNum.toString().length, // calculate menu title position
            menuItemsNum = (headerNum % 2 === 0) ? 2 : 3, // number of menu items: 2 for even, 3 for odd
            menuPosX = headerNum * 50 - 10,
            menuPosY = 30,
            itemHeight = 30,
            itemsMatrix = [];

        // menu shadow
        ctx.fillStyle = 'rgba(0, 0, 0, .15)';
        ctx.fillRect(menuPosX + 3, menuPosY + 3, menuWidth, (menuItemsNum + 1) * itemHeight);

        // menu arrow
        ctx.beginPath();
        ctx.moveTo(menuPosX, menuPosY);
        ctx.lineTo(menuPosX + 5, menuPosY - 5);
        ctx.lineTo(menuPosX + 10, menuPosY);
        ctx.lineTo(menuPosX, menuPosY);
        ctx.fillStyle = '#eee';
        ctx.fill();

        // menu body
        ctx.fillRect(menuPosX, menuPosY, menuWidth, (menuItemsNum + 1) * itemHeight);

        // menu title
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px courier';
        ctx.textBaseline = 'top';
        ctx.fillText(headerNum, menuPosX + titlePos, menuPosY + 8);

        // add menu title coordinates to array
        itemsMatrix.push({
            itemType: 'menu',
            itemNum: 0,
            x: menuPosX,
            y: menuPosY,
            w: menuWidth,
            h: itemHeight
        });

        // menu items
        for (var i = 1; i <= menuItemsNum; i++) {
            // item separator
            ctx.strokeStyle = '#bbb';
            ctx.beginPath();
            ctx.moveTo(menuPosX + 5, menuPosY + i * itemHeight + 0.5);
            ctx.lineTo(menuPosX + 79, menuPosY + i * itemHeight + 0.5);
            ctx.stroke();

            // item
            ctx.fillStyle = '#000';
            ctx.fillText("Menu " + i, menuPosX + 8, menuPosY + 8 + i * itemHeight);

            // add item coordinates to array
            itemsMatrix.push({
                itemType: 'menu',
                itemNum: i,
                x: menuPosX,
                y: menuPosY + i * itemHeight,
                w: menuWidth,
                h: itemHeight
            });
        }

        this.menuOpened = true;

        return itemsMatrix;
    };

    /**
     * Draws dialog with # of menu item.
     * @param {String} item
     */
    TableMenu.prototype.drawPopup = function (item) {
        var ctx = this.ctx,
            popupWidth = 200,
            popupHeight = 100,
            popupMargin = (this.table.width < 276) ? 0 : 72,
            popupPosX = (this.table.width - popupMargin) / 2 - 100,
            popupPosY = 30;

        // popup shadow
        ctx.fillStyle = 'rgba(0, 0, 0, .15)';
        ctx.fillRect(popupPosX + 3, popupPosY + 3, popupWidth, popupHeight);

        // popup body
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ddd';
        ctx.strokeRect(popupPosX, popupPosY, popupWidth, popupHeight);
        ctx.fillStyle = '#fff';
        ctx.fillRect(popupPosX + 1, popupPosY + 1, popupWidth - 2, popupHeight - 2);

        // popup main message
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px courier';
        ctx.textBaseline = 'top';
        ctx.fillText(item, popupPosX + 14, popupPosY + 40);

        // popup close message
        ctx.font = 'normal 11px courier';
        ctx.fillText('click to close', popupPosX + 51, popupPosY + 82);
    };

    /**
     * Returns area title where intersection occurred.
     * @param {Number} x
     * @param {Number} y
     * @returns {Object}
     */
    TableMenu.prototype.intersection = function (x, y) {
        var intersectionArea = {},
            area = this.areaMatrix;

        for (var i = 0; i < area.length; i++) {
            var left = area[i].x,
                right = area[i].x + area[i].w,
                top = area[i].y,
                bottom = area[i].y + area[i].h;

            if (right >= x && left <= x && bottom >= y && top <= y) {
                intersectionArea = area[i];
            }
        }

        return intersectionArea;
    };

    var menu = new TableMenu();
    menu.init();

})(document);
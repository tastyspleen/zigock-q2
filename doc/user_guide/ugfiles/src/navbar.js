/******************************************************************************
* navbar.js                                                                   *
*                                                                             *
* Copyright 1999 by Mike Hall.                                                *
* Web address: http://www.brainjar.com                                        *
* Last update: October 13, 1999.                                              *
*                                                                             *
* Creates a interactive DHTML navigation bar with drop-down menus.            *
* Note: requires dhtmllib.js                                                  *
******************************************************************************/

//*****************************************************************************
// Define the default look of the navigation bar.
//*****************************************************************************

var navBarY = -1;    // Default position.
var navBarX = -1;

var navBarTrackX = false;    // Tracking flags.
var navBarTrackY = false;

var navBarHeaderWidth  = 175;    // Sizes.
var navBarMenuWidth    = 175;
var navBarBorderWidth  =   1;
var navBarPaddingWidth =   4;

var navBarBorderColor   = "#000000";    // Colors.
var navBarHeaderBgColor = "#c0c0c0";
var navBarHeaderFgColor = "#000000";
var navBarActiveBgColor = "#006AD5";
var navBarActiveFgColor = "#ffffff";
var navBarItemBgColor   = "#c0c0c0";
var navBarItemFgColor   = "#000000";
var navBarHighBgColor   = "#0099FF";
var navBarHighFgColor   = "#000000";

var navBarHeaderFontFamily = "Arial,Helvetica,sans-serif";    // Fonts.
var navBarHeaderFontStyle  = "plain";
var navBarHeaderFontWeight = "bold";
var navBarHeaderFontSize   = "10pt";
var navBarItemFontFamily   = "sans-serif,Arial,Helvetica,MS Sans Serif";
var navBarItemFontStyle    = "plain";
var navBarItemFontWeight   = "bold";
var navBarItemFontSize     = "8pt";

//*****************************************************************************
// Define the navigation bar menu array.
//*****************************************************************************

var navBarMenus = new Array();    // List of menus.

//*****************************************************************************
// Initialize the navigation bar.
//*****************************************************************************

var navBar;         // Base layer.
var navBarWidth;    // Navigation bar width.

// These variables are used to determine if a resize event is a true one.
// Necessary due to a bug in older NS 4 releases.

var origWidth;
var origHeight;

function navBarInit() {

  var menu = new Array();
  var layer, norm, high, dmmy;
  var width;
  var on, off;
  var i, j, x, y, z;
  var link;

  if (!isMinNS4 && !isMinIE4)
    return;

  // Fix for resize bug.

  if (isMinNS4) {
    origWidth  = window.innerWidth;
    origHeight = window.innerHeight;
  }
  window.onresize = navBarReload;

  // Check sizes.

  if (navBarMenuWidth < navBarHeaderWidth)
    navBarMenuWidth = navBarHeaderWidth;

  // Build the navigation bar.

  navBarBuild();
  moveLayerTo(navBar, navBarX, navBarY);
  showLayer(navBar);

  // Get each menu, position it, initialize it and set up event handling.

  x = 0;
  y = 0;
  i = 0;
  while ((layer = getLayer("menu" + (i + 1), window)) != null) {

    // Set menu width.

    width = navBarMenuWidth;
    if (i == navBarMenus.length - 1)
      width = Math.max(navBarHeaderWidth,
              navBarWidth - (navBarMenus.length - 1) * navBarHeaderWidth);

    // Initialize the menu container.

    menu[i] = layer;
    moveLayerTo(layer, x, y);

    // Initialize the three layers that make up each menu item.

    z = 0;
    j = 0;
    while ((layer = getLayer("item" + (i + 1) + "_" + (j + 1), menu[i])) != null) {

      // Normal item layer.

      norm = layer;
      moveLayerTo(norm, 0, z);
      clipLayer(norm, navBarBorderWidth, navBarBorderWidth,
                width - navBarBorderWidth,
                getHeight(norm) - navBarBorderWidth);
      if (isMinNS4 && j > 0)
        layer.visibility = "inherit";
      else
        showLayer(norm);

      // Highlighted item layer.

      high = getLayer("high" + (i + 1) + "_" + (j + 1), menu[i]);
      moveLayerTo(high, 0, z);
      clipLayer(high, navBarBorderWidth, navBarBorderWidth,
                width - navBarBorderWidth,
                getHeight(norm) - navBarBorderWidth);
      hideLayer(high);

      // Transparent, dummy item layer. Used to capture mouse events.

      dmmy = getLayer("dmmy" + (i + 1) + "_" + (j + 1), menu[i]);
      moveLayerTo(dmmy, 0, z);
      clipLayer(dmmy, 0, 0, width, getHeight(norm));
      if (j == 0)
        menu[i].high = high;
      else {
        dmmy.high = high;
        dmmy.onmouseover = navBarItemOn;
        dmmy.onmouseout  = navBarItemOff;
      }
      link = navBarMenus[i][j * 2 + 1];
      if (link != "") {
        if (isMinNS4) {
          dmmy.document.link = link;
          dmmy.document.onmousedown = navBarItemGo;
        }
        if (isMinIE4) {
          dmmy.link = link;
          dmmy.onmousedown = navBarItemGo;
        }
      }

      // Set up position for next item.

      z += getHeight(norm) - navBarBorderWidth;
      if (j == 0)
        off = z + navBarBorderWidth - 1;
      on = z + navBarBorderWidth;
      j++;
    }
    x += navBarHeaderWidth - navBarBorderWidth;

    // Set up clipping sizes for menu container.

    menu[i].offWidth  = navBarHeaderWidth;
    menu[i].offHeight = off + 1;
    menu[i].onWidth   = width;
    menu[i].onHeight  = on;
    menu[i].onmouseover = navBarMenuOn;
    menu[i].onmouseout  = navBarMenuOff;
    clipLayer(menu[i], 0, 0, menu[i].offWidth, menu[i].offHeight);

    // Display the menu container layer.

    showLayer(menu[i]);
    i++;
  }

  // Dummy out mouse events for the filler.

    menu[i - 1].onmouseover = null;
    menu[i - 1].onmouseout  = null;

  // Clip filler to fit window width.

  clipLayer(menu[i - 1], 0, 0, menu[i - 1].onWidth, menu[i - 1].offHeight);

  // Clip base layer so it won't interfere with underlying page.

  clipLayer(navBar, 0, 0, navBarWidth, menu[0].offHeight);

  // Set tracking.

  if (navBarTrackX || navBarTrackY) {
    if (isMinNS4)
      navBarScroll();
    if (isMinIE4)
      window.onscroll = navBarScroll;
  }
}

//*****************************************************************************
// Dynamically build the HTML for the navigation bar and add it to the page.
//*****************************************************************************

function navBarBuild() {

  var i, j, k, str, tmp;
  var padding, width;
  var headText, actvText, itemText, highText;
  var tblStart, tblEnd;

  // Add a dummy menu for filler.

  navBarMenus[navBarMenus.length] = new Array("&nbsp;", "");

  // Set bar width to fill window.

  navBarWidth = Math.max(getWindowWidth(), getPageWidth());

  // Set up code for menu item text.

  padding = navBarPaddingWidth + navBarBorderWidth;
  headText = 'color:' + navBarHeaderFgColor + ';'
           + 'font-family:' + navBarHeaderFontFamily + ';'
           + 'font-size:' + navBarHeaderFontSize + ';'
           + 'font-style:' + navBarHeaderFontStyle + ';'
           + 'font-weight:' + navBarHeaderFontWeight + ';';
  actvText = 'color:' + navBarActiveFgColor + ';'
           + 'font-family:' + navBarHeaderFontFamily + ';'
           + 'font-size:' + navBarHeaderFontSize + ';'
           + 'font-style:' + navBarHeaderFontStyle + ';'
           + 'font-weight:' + navBarHeaderFontWeight + ';';
  itemText = 'color:' + navBarItemFgColor + ';'
           + 'font-family:' + navBarItemFontFamily + ';'
           + 'font-size:' + navBarItemFontSize + ';'
           + 'font-style:' + navBarItemFontStyle + ';'
           + 'font-weight:' + navBarItemFontWeight + ';';
  highText = 'color:' + navBarHighFgColor + ';'
           + 'font-family:' + navBarItemFontFamily + ';'
           + 'font-size:' + navBarItemFontSize + ';'
           + 'font-style:' + navBarItemFontStyle + ';'
           + 'font-weight:' + navBarItemFontWeight + ';';
  tblStart = '<table border=0 cellpadding=' + padding
           + ' cellspacing=0 width="100%"><tr><td>';
  tblEnd   = '</td></tr></table>';

  // Build HTML code for the menus.

  str = "";
  for (i = 0; i < navBarMenus.length; i++) {

    // Set menu width, the filler should be wide enough to fit the window.

    width = navBarMenuWidth;
    if (i == navBarMenus.length - 1)
      width = Math.max(navBarHeaderWidth,
              navBarWidth - (navBarMenus.length - 1) * navBarHeaderWidth);

    if (isMinNS4)
      str += '<layer name="menu' + (i + 1) + '"'
          +  ' bgcolor="' + navBarBorderColor + '"'
          +  ' width=' + width
          +  ' visibility=hidden>\n'
    if (isMinIE4)
      str += '<div id="menu' + (i + 1) + '"'
          +  ' style="position:absolute;'
          +  ' background-color: ' + navBarBorderColor + ';'
          +  ' width=' + width + 'px;'
          +  ' height=100%;'
          +  ' visibility: hidden;">\n';
    for (k = 0; k < navBarMenus[i].length; k += 2) {
      j = k / 2;
      tmp = (i + 1) + "_" + (j + 1);
      if (j == 0) {
        if (isMinNS4) {
          str += '  <layer name="item' + tmp + '" '
              +  ' bgcolor="' + navBarHeaderBgColor + '" '
              +  ' width=' + width + '>' + tblStart
              +  '<span style="' + headText + '">' + navBarMenus[i][k]
              +  '</span>' + tblEnd + '</layer>\n';
          str += '  <layer name="high' + tmp + '" '
              +  ' bgcolor="' + navBarActiveBgColor + '" '
              +  ' width=' + width + '>' + tblStart
              +  '<span style="' + actvText + '">' + navBarMenus[i][k]
              +  '</span>' + tblEnd + '</layer>\n';
          str += '  <layer name="dmmy' + tmp + '" '
              +  ' width=' + width + '>'
              +  '</layer>\n';
        }
        if (isMinIE4) {
          str += '  <div id="item' + tmp + '"'
              +  ' style="position:absolute;'
              +  ' background-color:' + navBarHeaderBgColor + ';'
              +  ' width:' + width + 'px;">' + tblStart
              +  '<span style="' + headText + '">' + navBarMenus[i][k]
              +  '</span>' + tblEnd + '</div>\n';
          str += '  <div id="high' + tmp + '"'
              +  ' style="position:absolute;'
              +  ' background-color:' + navBarActiveBgColor + ';'
              +  ' width:' + width + 'px;">' + tblStart
              +  '<span style="' + actvText + '">' + navBarMenus[i][k]
              +  '</span>' + tblEnd + '</div>\n';
          str += '  <div id="dmmy' + tmp + '"'
              +  ' style="position:absolute;'
              +  ' width=' + width + ';'
              +  ' height=100%;">'
              +  '</div>\n';
        }
      }
      else {
        if (isMinNS4) {
          str += '  <layer name="item' + tmp + '" '
              +  ' bgcolor="' + navBarItemBgColor + '" '
              +  ' width=' + width + '>' + tblStart
              +  '<span style="' + itemText + '">' + navBarMenus[i][k]
              +  '</span>' + tblEnd + '</layer>\n';
          str += '  <layer name="high' + tmp + '" '
              +  ' bgcolor="' + navBarHighBgColor + '" '
              +  ' width=' + width + '>' + tblStart
              +  '<span style="' + highText + '">' + navBarMenus[i][k]
              +  '</span>' + tblEnd + '</layer>\n';
          str += '  <layer name="dmmy' + tmp + '" '
              +  ' width=' + width + '>'
              +  '</layer>\n';
        }
        if (isMinIE4) {
          str += '  <div id="item' + tmp + '"'
              +  ' style="position:absolute;'
              +  ' background-color:' + navBarItemBgColor + ';'
              +  ' width:' + width + 'px;">' + tblStart
              +  '<span style="' + itemText + '">' + navBarMenus[i][k]
              +  '</span>' + tblEnd + '</div>\n';
          str += '  <div id="high' + tmp + '"'
              +  ' style="position:absolute;'
              +  ' background-color:' + navBarHighBgColor + ';'
              +  ' width:' + width + 'px;">' + tblStart
              +  '<span style="' + highText + '">' + navBarMenus[i][k]
              +  '</span>' + tblEnd + '</div>\n';
          str += '  <div id="dmmy' + tmp + '"'
              +  ' style="position:absolute;'
              +  ' width=' + width + ';'
              +  ' height=100%;">'
              +  '</div>\n';
        }
      }
    }
    if (isMinNS4)
      str += '</layer>\n';
    if (isMinIE4)
      str += '</div>\n';
  }

  // Create it as a new layer.

  if (isMinNS4) {
    navBar = new Layer(width);
    navBar.document.writeln(str);
    navBar.document.close();
    clipLayer(navBar, 0, 0, navBarWidth, getWindowHeight());
  }
  if (isMinIE4) {
    str = '<div id="navBar" style="position:absolute;'
        + ' width:' + navBarWidth + 'px;'
        + ' height:100%;">'
        + str + '</div>\n';
    document.body.insertAdjacentHTML("BeforeEnd",str);
    navBar = getLayer("navBar");
  }
}

//*****************************************************************************
// Event handlers for the navigation bar.
//*****************************************************************************

function navBarScroll() {

  var x, y, d;

  // Resposition navigation bar.

  x = navBarX;
  d = getPageScrollX() - navBarX;
  if (navBarTrackX && d > 0)
    x += d;
  y = navBarY;
  d = getPageScrollY() - navBarY;
  if (navBarTrackY && d > 0)
    y += d;
  moveLayerTo(navBar, x, y);

  // Set up next call.

  if (isMinNS4)
    setTimeout('navBarScroll()', 25);

  return;
}

function navBarMenuOn() {

  // Display the menu by clipping containter to full view.

  clipLayer(this, 0, 0, this.onWidth, this.onHeight);
  clipLayer(navBar, 0, 0, navBarWidth, this.onHeight);
  showLayer(this.high);
}

function navBarMenuOff() {

  // Hide the menu by clipping container to show only the header item.

  if (isMinIE4 && window.event.toElement &&
      window.event.srcElement.id.substr(4, 1) ==
      window.event.toElement.id.substr(4, 1))
    return;
  clipLayer(this, 0, 0, this.offWidth, this.offHeight);
  clipLayer(navBar, 0, 0, navBarWidth, this.offHeight);
  hideLayer(this.high);
}

function navBarItemOn() {

  // Show the highlighted layer for this item.

  showLayer(this.high)
}

function navBarItemOff() {

  // Hide the highlighted layer for this item.

  hideLayer(this.high)
}

function navBarItemGo() {

  // If the link starts with "javascript:" execute the code. Otherwise just
  // link to the URL.

  if (this.link.indexOf("javascript:") == 0)
    eval(this.link);
  else
    window.location.href = this.link;

  return false;
}

function navBarReload() {

  // Reload page in case of a browser resize. First make sure it's a true
  // resize.

  if (isMinNS4 && origWidth == window.innerWidth && origHeight == window.innerHeight)
    return;
  window.location.href = window.location.href;
}

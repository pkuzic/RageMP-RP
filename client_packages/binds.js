cursorVisible = 0;

mp.keys.bind(0x71, true, function() {
    if (!cursorVisible) {
        mp.gui.cursor.show(true, true);
        cursorVisible = 1;
    } else {
        mp.gui.cursor.show(false, false);
        cursorVisible = 0;
    }
});

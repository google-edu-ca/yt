function onCreate()
	-- background shit

	makeLuaSprite('fnfstage', 'fnfstage', 305, 290);
        addLuaSprite('fnfstage', false);
	makeLuaSprite('news', 'news', 0, 0);
        addLuaSprite('news', true);
	makeLuaSprite('theotherhalf', 'theotherhalf', -10, 0);
        addLuaSprite('theotherhalf', false);
	
	close(true); --For performance reasons, close this script once the stage is fully loaded, as this script won't be used anymore after loading the stage
end
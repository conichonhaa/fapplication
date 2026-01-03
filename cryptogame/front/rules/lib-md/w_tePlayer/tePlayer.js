var tePlayerMgr = {
	init: function () {
		var self = this;
		if (document.readyState == 'loading') {
			document.addEventListener('DOMContentLoaded', function () {
				self.initPlayers();
			});
		} else {
			self.initPlayers();
		}
	},

	initPlayers: function () {
		var self = this;
		var playerElts = document.querySelectorAll('.tePlayer');
		Array.prototype.forEach.call(playerElts, function (playerElt) {
			var ctrlElt = playerElt.querySelector('.tepController');
			if ('MediaElement' in window) {
				new MediaElement(playerElt.querySelector('audio,video'), {
					success: function() {
						self.initController(ctrlElt);
					}
				});
			} else {
				self.initController(ctrlElt);
			}
		});
	},

	initController: function(ctrlElt) {
		var ctrl = teMgr.initController(ctrlElt, [
			new TEActiveMouse(1500),
			new TEFullscreenCtrl('.tepFullscreen'),
			new TEOnlyOnePlayingCtrl(),
			new TESettingsFromTracks('tep', '.tepFullscreen'),
			new TEErrorHandler(),
			new TESessionCurrentSubtitle('.tepSubtitlesList')
		]);
	}
};


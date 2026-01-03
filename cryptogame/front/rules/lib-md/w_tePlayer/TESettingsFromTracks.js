TESettingsFromTracks = function(classPrefix, insertBefore, subTitlesArea, transcriptArea, transcriptSubWin) {
	this.classPrefix = classPrefix;
	this.insertBefore = insertBefore;
	this.subTitlesArea = subTitlesArea || '.' + this.classPrefix + 'SubtitlesArea';
	this.transcriptArea = transcriptArea || '.' + this.classPrefix + 'TranscriptArea';
};

TESettingsFromTracks.ctrlCount = 0;

TESettingsFromTracks.prototype = {
	init: function(ctrl) {
		var self = this;
		this.ctrl = ctrl;
		this.insertBefore = ctrl.container.querySelector(this.insertBefore);
		this.subTitlesArea = ctrl.container.querySelector(this.subTitlesArea);
		this.transcriptArea = ctrl.container.querySelector(this.transcriptArea);

		var media = ctrl.media.originalNode || ctrl.media;
		var subtitleTracks = [], altVideoTrack, audioDescTrack, transcriptTrack;
		for (var child = media.firstElementChild; child; child = child.nextElementSibling) {
			if (child.localName == 'track') {
				if (child.getAttribute('kind') == 'subtitles') subtitleTracks.push(child);
			} else if (child.localName == 'audio-track') {
				if (child.getAttribute('kind') == 'descriptions') audioDescTrack = child;
			} else if (child.localName == 'video-track') {
				if (child.getAttribute('kind') == 'sign') altVideoTrack = child;
			} else if (child.localName == 'html-track') {
				if (child.getAttribute('kind') == 'captions') transcriptTrack = child;
			}
		}
		if (subtitleTracks.length || audioDescTrack || altVideoTrack || transcriptTrack) {
			var settingsList = document.createElement('ul');
			settingsList.className = this.classPrefix + 'SettingsList';

			this.subTitlesArea.hidden = true;
			if (subtitleTracks.length) {
				var subtitlesList = document.createElement('ul');
				subtitlesList.className = this.classPrefix + 'SubtitlesList';
				var subtitlesName = this.classPrefix + 'Subtitles_' + TESettingsFromTracks.ctrlCount;
				subtitlesList.appendChild(self.createSubtitleItem(null, subtitlesName));
				subtitleTracks.forEach(function (track) {
					subtitlesList.appendChild(self.createSubtitleItem(track,subtitlesName));
				});

				var subtitlesItem = settingsList.appendChild(document.createElement('li'));
				var subtitlesBtn = subtitlesItem.appendChild(this.createPressButton(
					this.classPrefix + 'SubtitlesBtn',
					"Sous-titres",
					"Afficher la liste des sous-titres",
					"Cacher la liste des sous-titres")
				);
				subtitlesItem.appendChild(this.createPanel(subtitlesBtn, this.classPrefix + 'SubtitlesPanel', subtitlesList));
			}

			if (audioDescTrack) {
				var audioDescItem = settingsList.appendChild(document.createElement('li'));
				var audioDescInput = audioDescItem.appendChild(this.createInput(
					this.classPrefix + 'AudioDesc',
					'checkbox',
					"Audio-description",
					"Écouter l\'audio-description",
					"Arrêter l\'audio-description")
				);
				audioDescInput.firstElementChild.onchange = function () {
					var src = audioDescTrack.getAttribute('src');
					if (this.checked) ctrl.addAudio(src);
					else ctrl.removeAudio(src)
				}
			}

			self.transcriptArea.hidden = true;
			if (transcriptTrack) {
				var transcriptItem = settingsList.appendChild(document.createElement('li'));
				var transcriptInput = transcriptItem.appendChild(this.createInput(
					this.classPrefix + 'Transcript',
					'checkbox',
					"Transcription",
					"Afficher la transcription",
					"Cacher la transcription")
				);
				transcriptInput.firstElementChild.onchange = function () {
					if (this.checked) {
						if (transcriptTrack.parentNode) {
							var content = document.createRange();
							content.selectNodeContents(transcriptTrack);
							self.transcriptArea.appendChild(content.extractContents());
							transcriptTrack.parentNode.removeChild(transcriptTrack);
						}
						ctrl.container.classList.add('teActiveTranscript');
						self.transcriptArea.hidden = false;
					} else {
						ctrl.container.classList.remove('teActiveTranscript');
						self.transcriptArea.hidden = true;
					}
				};

			}

			if (altVideoTrack) {
				var altVideoItem = settingsList.appendChild(document.createElement('li'));
				var altVideoInput = altVideoItem.appendChild(this.createInput(
					this.classPrefix + 'AltVideo',
					'checkbox',
					"Alternative vidéo (LSF, LPC)",
					"Regarder l\'alternative vidéo",
					"Quitter l\'alternative vidéo")
				);
				altVideoInput.firstElementChild.onchange = function () {
					if (this.checked) ctrl.switchMedia(altVideoTrack.getAttribute('src'));
					else ctrl.restoreMedia()
				}
			}

			var settingsBtn = this.createPressButton(
				this.classPrefix + 'SettingsBtn',
				"Options d\'accessibilité",
				"Afficher les options d\'accessibilité",
				"Cacher les options d\'accessibilité",
				true);
			var settingsPanel = this.createPanel(settingsBtn, this.classPrefix + 'SettingsPanel', settingsList);

			ctrl.element.insertBefore(settingsBtn, this.insertBefore);
			ctrl.element.insertBefore(settingsPanel, this.insertBefore);
		}
		TESettingsFromTracks.ctrlCount++;
	},

	createPanel: function (btn, className, content) {
		var panel = document.createElement('div');
		panel.hidden = true;
		panel.className = className;
		panel.setAttribute('role', 'dialog');
		var closeBtn = panel.appendChild(this.createButton(
			this.classPrefix + 'VisuallyHidden',
			"Fermer",
			"Fermer la fenêtre")
		);
		panel.appendChild(content);
		var focusOutBtn = panel.appendChild(this.createButton(
			this.classPrefix + 'VisuallyHidden',
			"Sortir",
			"Sortir de la fenêtre",
			true)
		);
		panel.appendChild(focusOutBtn);
		var focusRingBtn = panel.appendChild(this.createButton(
			this.classPrefix + 'VisuallyHidden',
			"Retour",
			"Retour en début de fenêtre", true)
		);

		function closePanel() {
			if (!panel.hidden) btn.click();
		}

		function mouseUpListener(event) {
			if (event.target != btn && !panel.contains(event.target)) {
				closePanel();
			}
		}

		btn.addEventListener('change', function () {
			if (panel.hidden) {
				panel.hidden = false;
				setTimeout(function () {
					closeBtn.focus();
				}, 200);
				window.addEventListener('mouseup', mouseUpListener);
			} else {
				panel.hidden = true;
				window.removeEventListener('mouseup', mouseUpListener);
			}
		});

		closeBtn.onclick = closePanel;
		focusOutBtn.onclick = function () {
			var focussableElements = 'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex=\'-1\'])';
			var focussable = Array.prototype.filter.call(ctrl.element.querySelectorAll(focussableElements), function (element) {
				return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
			});
			var index = focussable.indexOf(document.activeElement);
			if(index > -1) {
				var nextElement = focussable[index + 1] || focussable[0];
				nextElement.focus();
			}
		};
		focusRingBtn.onfocus = function () {
			closeBtn.focus();
		};

		panel.addEventListener('change', function () {
			closePanel();
		});

		window.addEventListener('keydown', function (event) {
			if (!panel.hidden && event.keyCode == 27 /* Escape */) {
				closePanel();
			}
		});

		return panel;
	},

	createButton: function (className, label, title, labelHidden) {
		var btn = document.createElement('button');
		btn.className = className;
		btn.title = title;
		var span = btn.appendChild(document.createElement('span'));
		span.textContent = label;
		if (labelHidden) span.className = this.classPrefix + 'VisuallyHidden';
		return btn;
	},


	createPressButton: function (className, label, title, pressedTitle, labelHidden) {
		var btn = this.createButton(className, label, title, labelHidden);
		btn.setAttribute('aria-pressed', 'false');
		btn.dataset.pressedTitle = pressedTitle;
		return btn;
	},

	createInput: function (className, type, label, title, checkedTitle, value) {
		var labelElt = document.createElement('label');
		var input = labelElt.appendChild(document.createElement('input'));
		labelElt.className = className;
		labelElt.tabIndex = 0;
		input.type = type;
		if (value !== undefined) input.value = value;
		labelElt.title = title;
		if (checkedTitle) input.addEventListener('change', function () {
			if (this.checked) labelElt.title = checkedTitle;
			else labelElt.title = title;
		});
		var span = labelElt.appendChild(document.createElement('span'));
		span.textContent = label;
		labelElt.addEventListener('keydown', function(event) {
			if (event.keyCode == 13 || event.keyCode == 32) {
				this.click();
			}
		});
		return labelElt;
	},

	createSubtitleItem: function (track, name) {
		var self = this;
		var item = document.createElement('li');
		var src = track ? track.getAttribute('src') : "";
		var title = track ?  "Activer les sous-titres " + track.getAttribute('srclang') : "Désactiver les sous-titres";
		var label = track ? track.getAttribute('srclang') : "Désactivés";
		var labelElt = item.appendChild(this.createInput(this.classPrefix + 'Subtitle', 'radio', label, title, null, src));
		labelElt.firstElementChild.name = name;
		labelElt.firstElementChild.onchange = function () {
			if (this.checked) self.ctrl.showSubtitle(src, self.subTitlesArea);
		};
		return item;
	},
};

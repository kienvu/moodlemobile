var templates = [
    "root/lib/text!root/plugins/participants/participants.html",
    "root/lib/text!root/plugins/participants/participant.html"
];

define(templates,function (participantsTpl, participantTpl) {
    var plugin = {
        settings: {
            name: "participants",
            type: "course",
            menuURL: "#participants/",
            lang: {
                component: "core"
            }
        },

        storage: {
            participant: {type: "model"},
            participants: {type: "collection", model: "participant"}
        },

        routes: [
            ["participants/:courseId", "participants", "showParticipants"],
            ["participant/:courseId/:userId", "participants", "showParticipant"],
        ],


        showParticipants: function(courseId) {
            MM.panels.showLoading('center');
            
            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }
    
            var data = {
                "courseid" : courseId
            };
            
            MM.moodleWSCall('moodle_user_get_users_by_courseid', data, function(users) {
                var tpl = {users: users, deviceType: MM.deviceType, courseId: courseId};
                var html = MM.tpl.render(MM.plugins.participants.templates.participants.html, tpl);
                MM.panels.show('center', html);
                // Load the first user
                if (MM.deviceType == "tablet" && users.length > 0) {
                    MM.plugins.participants.showParticipant(courseId, users.shift().id);
                }
            });
        },

        showParticipant: function(courseId, userId) {
            var data = {
                "userlist[0][userid]": userId,
                "userlist[0][courseid]": courseId
            }
            MM.moodleWSCall('moodle_user_get_course_participants_by_id', data, function(users) {
                // Load the active user plugins.
                
                var userPlugins = [];
                for (var el in MM.plugins) {
                    var plugin = MM.plugins[el];
                    if (plugin.settings.type == "user") {
                        userPlugins.push(plugin.settings);
                    }
                }
                
                var tpl = {"user": users.shift(), "plugins": userPlugins, "courseid": courseId};
                var html = MM.tpl.render(MM.plugins.participants.templates.participant.html, tpl);
                MM.panels.show('right', html);
            });
        },

        
        templates: {
            "participant": {
                model: "participant",
                html: participantTpl
            },
            "participants": {
                html: participantsTpl
            }
        }
    }

    MM.registerPlugin(plugin);
});
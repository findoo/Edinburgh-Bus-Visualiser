module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-htmlhint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.initConfig({
        jshint: {
            js_target: {
                src: ['./server/server.js', './webapp/app.js']
            },
            options: {
                force: true
            },
        },

        cssmin: {
            build: {
                src: './webapp/css.css',
                dest: './webapp/css.min.css'
            }
        },

        htmlhint: {
            build: {
                options: {
                    'tag-pair': true,
                    'tagname-lowercase': true,
                    'attr-lowercase': true,
                    'attr-value-double-quotes': true,
                    'spec-char-escape': true,
                    'id-unique': true
                },
                src: ['./webapp/index.html']
            }
        },
    });
    grunt.registerTask('default', ['jshint', 'cssmin', 'htmlhint']);
};
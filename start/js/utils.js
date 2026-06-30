        // ==========================================
        // HTML SANITIZATION & UTILITY HELPERS
        // ==========================================

        /**
         * Escape HTML special characters in a string to prevent injection
         * when inserting user-supplied text (titles, descriptions) via innerHTML.
         */
        function escapeHTML(str) {
            if (!str) return '';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

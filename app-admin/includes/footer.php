  </main>
</div>
<?php $adminJsVersion = is_file(__DIR__ . '/../assets/js/admin-files.js') ? (string) filemtime(__DIR__ . '/../assets/js/admin-files.js') : '1'; ?>
<script src="assets/js/admin-files.js?v=<?php echo e($adminJsVersion); ?>"></script>
</body>
</html>

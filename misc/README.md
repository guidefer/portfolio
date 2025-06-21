# Miscellaneous Files

This folder contains development artifacts, test files, and documentation that are not part of the main production portfolio site.

## 📁 Folder Structure

### `/test-files/`
Contains all test and debug HTML files used during development:
- Animation tests
- Mascot behavior tests  
- CSS compatibility tests
- Browser-specific debug files
- Console warning tests
- Empty development scripts

### `/documentation/`
Contains development documentation and progress reports:
- Feature completion reports
- Bug fix documentation
- Status updates
- Enhancement summaries
- Technical implementation notes

## 🎯 Purpose

These files were created during the development process to:
- Test specific functionality in isolation
- Debug cross-browser compatibility issues
- Document development progress
- Validate fixes and improvements
- Ensure code quality

## 📝 Usage

These files are primarily for development reference and can be used to:
- Understand how specific features were implemented
- Debug issues by referencing test cases
- Review the development timeline
- Access isolated testing environments

## 🧹 Maintenance

This folder helps keep the main project directory clean by organizing:
- ✅ Non-production files
- ✅ Development artifacts
- ✅ Test implementations
- ✅ Progress documentation

## 📋 Future Development Guidelines

To maintain this organized structure, please follow these guidelines when creating new files:

### **Creating Test Files**
When creating new test or debug files:
```bash
# Create test files in misc/test-files/
touch misc/test-files/your-new-test.html
touch misc/test-files/debug-feature-name.html
touch misc/test-files/compatibility-browser-test.html
```

**Test file naming conventions:**
- `*-test.html` - General functionality tests
- `debug-*.html` - Debug and diagnostic files
- `*-compatibility-*.html` - Browser compatibility tests
- `mascot-*.html` - Mascot-specific tests
- `animation-*.html` - Animation-related tests

### **Creating Documentation**
When documenting progress, fixes, or features:
```bash
# Create documentation in misc/documentation/
touch misc/documentation/FEATURE-NAME-COMPLETE.md
touch misc/documentation/BUG-FIX-RESOLVED.md
touch misc/documentation/STATUS-UPDATE.md
```

**Documentation naming conventions:**
- `*-COMPLETE.md` - Feature completion reports
- `*-FIXES.md` - Bug fix documentation
- `*-STATUS.md` - Status reports and updates
- `*-RESOLVED.md` - Problem resolution documentation
- `*-PLAN.md` - Planning and strategy documents

### **Root Directory Guidelines**
**Keep the root directory clean** by only adding files that are:
- ✅ **Production essential** (index.html, main assets)
- ✅ **Core documentation** (PROJECT-PLAN.md)
- ✅ **Build/deployment files** (sw.js, favicon files)

**Never add to root:**
- ❌ Test files (.html test pages)
- ❌ Debug files
- ❌ Progress documentation
- ❌ Temporary scripts
- ❌ Development artifacts

### **Quick Commands**
```bash
# Quick way to create organized files:
mkdir -p misc/test-files misc/documentation

# Create a new test file
touch misc/test-files/$(date +%Y%m%d)-your-test.html

# Create a new documentation file
touch misc/documentation/$(date +%Y%m%d)-FEATURE-UPDATE.md
```

---

*Following these guidelines will keep the workspace organized and professional for continued development.*

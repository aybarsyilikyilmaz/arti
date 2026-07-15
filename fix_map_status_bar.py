with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate old status bar on Screen 2 (Map view)
old_status_bar = """        <div class="status-bar" style="position: absolute; top: 0; left: 0; right: 0; z-index: 10;">
          <span>9:41</span>
          <span class="status-icons">
            <svg width="16" height="11" viewBox="0 0 16 11" fill='none'><rect x="0" y="7" width="2.5" height="4" rx="0.5" fill='currentColor'/><rect x="4.5" y="5" width="2.5" height="6" rx="0.5" fill='currentColor'/><rect x="9" y="3" width="2.5" height="8" rx="0.5" fill='currentColor'/><rect x="13.5" y="0" width="2.5" height="11" rx="0.5" fill='currentColor'/></svg>
            <svg width="24" height="12" viewBox="0 0 24 12" fill='none'><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="15" height="8" rx="1.2" fill='currentColor'/><rect x="21.5" y="3.5" width="1.6" height="5" rx="0.8" fill='currentColor'/></svg>
          </span>
        </div>"""

# Re-design to use glassmorphism background + add 5G to match Screen 1
new_status_bar = """        <div class="status-bar" style="position: absolute; top: 0; left: 0; right: 0; z-index: 10; background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.06); color: #000;">
          <span>9:41</span>
          <span class="status-icons" style="display: flex; align-items: center; gap: 0.3rem;">
            <svg width="16" height="11" viewBox="0 0 16 11" fill='none'><rect x="0" y="7" width="2.5" height="4" rx="0.5" fill='currentColor'/><rect x="4.5" y="5" width="2.5" height="6" rx="0.5" fill='currentColor'/><rect x="9" y="3" width="2.5" height="8" rx="0.5" fill='currentColor'/><rect x="13.5" y="0" width="2.5" height="11" rx="0.5" fill='currentColor'/></svg>
            <span style="font-size: 0.75rem; font-weight: bold; margin-left: 2px; color: #000;">5G</span>
            <svg width="24" height="12" viewBox="0 0 24 12" fill='none' style="margin-left: 4px;"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="15" height="8" rx="1.2" fill='currentColor'/><rect x="21.5" y="3.5" width="1.6" height="5" rx="0.8" fill='currentColor'/></svg>
          </span>
        </div>"""

content = content.replace(old_status_bar, new_status_bar)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully fixed status bar transparency and alignment on Screen 2!")

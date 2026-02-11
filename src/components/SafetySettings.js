import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertTriangle, Loader, Eye, Lock } from 'lucide-react';
import { safetyAPI } from '../services/safetyAPI';

const SafetySettings = ({ facultyId }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    visibleToYears: ['1st', '2nd', '3rd', '4th'],
    visibleToDepartments: ['All'],
    emergencyOnlyMode: false,
    autoExpireAlerts: true,
    alertExpiryHours: 24,
    requireConfirmation: false,
    enableNotifications: true,
    notificationChannels: ['Email', 'In-App'],
    hideIdentity: false,
    archiveOldReports: true,
    archiveAfterDays: 90
  });

  useEffect(() => {
    // Simulate loading settings from backend
    setLoading(false);
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiSelect = (key, value) => {
    setSettings(prev => {
      const current = prev[key];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const handleSave = async () => {
    try {
      await safetyAPI.updateSafetySettings(facultyId, settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      setSettings({
        visibleToYears: ['1st', '2nd', '3rd', '4th'],
        visibleToDepartments: ['All'],
        emergencyOnlyMode: false,
        autoExpireAlerts: true,
        alertExpiryHours: 24,
        requireConfirmation: false,
        enableNotifications: true,
        notificationChannels: ['Email', 'In-App'],
        hideIdentity: false,
        archiveOldReports: true,
        archiveAfterDays: 90
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader size={40} className="animate-spin text-blue-600" /></div>;
  }

  const years = ['1st', '2nd', '3rd', '4th'];
  const departments = ['All', 'Engineering', 'Science', 'Commerce', 'Arts', 'Management'];
  const channels = ['Email', 'In-App', 'SMS', 'Push Notification'];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings size={32} className="text-slate-900" />
        <h2 className="text-2xl font-bold text-slate-900">Safety Center Settings</h2>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-[12px] bg-amber-50 border border-amber-200 p-4">
        <AlertTriangle size={20} className="text-amber-600 mt-1 flex-shrink-0" />
        <div>
          <p className="font-semibold text-amber-900">Visibility Settings</p>
          <p className="text-sm text-amber-800 mt-1">These settings control who can see safety information, alerts, and incident reports in the student portal.</p>
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="rounded-[16px] border border-slate-200 bg-white p-6">
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
            <Eye size={20} />
            Visibility Control
          </h3>

          {/* Years Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">Visible to Academic Years:</label>
            <div className="grid gap-3 md:grid-cols-4">
              {years.map(year => (
                <label key={year} className="flex items-center gap-2 p-3 border border-slate-200 rounded-[8px] cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={settings.visibleToYears.includes(year)}
                    onChange={() => handleMultiSelect('visibleToYears', year)}
                    className="rounded"
                  />
                  <span className="font-medium text-slate-700">{year} Year</span>
                </label>
              ))}
            </div>
          </div>

          {/* Departments Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">Visible to Departments:</label>
            <div className="grid gap-3 md:grid-cols-3">
              {departments.map(dept => (
                <label key={dept} className="flex items-center gap-2 p-3 border border-slate-200 rounded-[8px] cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={settings.visibleToDepartments.includes(dept)}
                    onChange={() => handleMultiSelect('visibleToDepartments', dept)}
                    className="rounded"
                  />
                  <span className="font-medium text-slate-700">{dept}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Emergency Only Mode */}
          <div className="p-4 rounded-[8px] bg-slate-50 border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emergencyOnlyMode}
                onChange={(e) => handleSettingChange('emergencyOnlyMode', e.target.checked)}
                className="rounded w-5 h-5"
              />
              <div>
                <p className="font-semibold text-slate-900">Emergency-Only Mode</p>
                <p className="text-sm text-slate-600">Only show critical alerts and emergency contacts to students</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="rounded-[16px] border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Alert Management</h3>

        <div className="space-y-4">
          {/* Auto-Expire Alerts */}
          <div className="flex items-center justify-between p-4 rounded-[8px] bg-slate-50 border border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Auto-Expire Alerts</p>
              <p className="text-sm text-slate-600">Automatically mark alerts as inactive after expiry time</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoExpireAlerts}
              onChange={(e) => handleSettingChange('autoExpireAlerts', e.target.checked)}
              className="rounded w-5 h-5"
            />
          </div>

          {/* Alert Expiry Duration */}
          {settings.autoExpireAlerts && (
            <div className="p-4 rounded-[8px] bg-blue-50 border border-blue-200">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Default Alert Expiry (hours):</label>
              <input
                type="number"
                min="1"
                max="720"
                value={settings.alertExpiryHours}
                onChange={(e) => handleSettingChange('alertExpiryHours', parseInt(e.target.value))}
                className="w-full md:w-40 rounded-[8px] border border-slate-200 px-4 py-2"
              />
            </div>
          )}

          {/* Require Confirmation */}
          <div className="flex items-center justify-between p-4 rounded-[8px] bg-slate-50 border border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Require Confirmation</p>
              <p className="text-sm text-slate-600">Ask for confirmation before creating critical alerts</p>
            </div>
            <input
              type="checkbox"
              checked={settings.requireConfirmation}
              onChange={(e) => handleSettingChange('requireConfirmation', e.target.checked)}
              className="rounded w-5 h-5"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="rounded-[16px] border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Notifications</h3>

        <div className="space-y-4">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between p-4 rounded-[8px] bg-slate-50 border border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Enable Notifications</p>
              <p className="text-sm text-slate-600">Send alerts and updates to students</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
              className="rounded w-5 h-5"
            />
          </div>

          {/* Notification Channels */}
          {settings.enableNotifications && (
            <div className="p-4 rounded-[8px] bg-blue-50 border border-blue-200">
              <label className="block text-sm font-semibold text-slate-900 mb-3">Notification Channels:</label>
              <div className="grid gap-3 md:grid-cols-2">
                {channels.map(channel => (
                  <label key={channel} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notificationChannels.includes(channel)}
                      onChange={() => handleMultiSelect('notificationChannels', channel)}
                      className="rounded"
                    />
                    <span className="font-medium text-slate-700">{channel}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="rounded-[16px] border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={20} />
          <h3 className="text-lg font-bold text-slate-900">Privacy & Data</h3>
        </div>

        <div className="space-y-4">
          {/* Hide Identity */}
          <div className="flex items-center justify-between p-4 rounded-[8px] bg-slate-50 border border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Anonymous Incident Reports</p>
              <p className="text-sm text-slate-600">Allow anonymous submission of incident reports</p>
            </div>
            <input
              type="checkbox"
              checked={settings.hideIdentity}
              onChange={(e) => handleSettingChange('hideIdentity', e.target.checked)}
              className="rounded w-5 h-5"
            />
          </div>

          {/* Archive Old Reports */}
          <div className="flex items-center justify-between p-4 rounded-[8px] bg-slate-50 border border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Auto-Archive Reports</p>
              <p className="text-sm text-slate-600">Archive resolved reports after specified days</p>
            </div>
            <input
              type="checkbox"
              checked={settings.archiveOldReports}
              onChange={(e) => handleSettingChange('archiveOldReports', e.target.checked)}
              className="rounded w-5 h-5"
            />
          </div>

          {/* Archive Duration */}
          {settings.archiveOldReports && (
            <div className="p-4 rounded-[8px] bg-slate-50 border border-slate-200">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Archive After (days):</label>
              <input
                type="number"
                min="7"
                max="365"
                value={settings.archiveAfterDays}
                onChange={(e) => handleSettingChange('archiveAfterDays', parseInt(e.target.value))}
                className="w-full md:w-40 rounded-[8px] border border-slate-200 px-4 py-2"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 flex-1 rounded-[12px] bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Save size={18} />
          Save Settings
        </button>
        <button
          onClick={handleReset}
          className="flex-1 rounded-[12px] border border-slate-200 px-6 py-3 text-sm font-semibold hover:bg-slate-50"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-[12px] bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Changes to visibility settings will apply immediately. Students will only see safety information based on their year and department assignments.
        </p>
      </div>
    </div>
  );
};

export default SafetySettings;

[Project Hub](../README.md) · [Installation Guide](installation.md) · [Eclipse](eclipse.md) · [Umbra](umbra.md) · [Development](development.md) · [Acknowledgements](../ACKNOWLEDGEMENTS.md)

# From download to first stream.

Install Umbra on each gaming PC, then Eclipse on the display device. Start with one working stream before adding the second host.

[Umbra · Windows](#umbra-windows) · [Umbra (Vibepollo) · Windows](#umbra-vibepollo) · [Umbra · Linux](#umbra-linux) · [Eclipse · LG webOS](#eclipse-webos) · [Eclipse · Windows](#eclipse-windows) · [Eclipse · Linux](#eclipse-linux)

<a name="before-you-start"></a>

## Choose the right component.

### Gaming PC → Umbra

Windows x64 or Linux host. Install once for ordinary streaming, or on two PCs for co-op. On Linux, co-op needs KDE Plasma or GNOME on Wayland. The game runs here. Already using Vibepollo? [Umbra (Vibepollo)](#umbra-vibepollo) keeps your settings.

### Screen device → Eclipse

LG webOS, Windows x64 or Linux x86_64 client. Install the package matching the device where you will view and control the stream.

Download an attached file under **Assets**, not GitHub’s automatically generated **Source code (zip)** or **Source code (tar.gz)**. Those are developer archives, not installable apps. Use the latest compatible stable release. If no package is attached for your platform, that download is not available.

[Pairing](#pairing) · [First co-op session](#coop) · [Troubleshooting and logs](#diagnostics) · [Tested hardware](../README.md#status)

<a name="umbra-windows"></a>

## 1A. Umbra on Windows

![Umbra host web interface showing the installed version, Apollo base and separate update-check results.](../site/media/umbra-host-home.webp)

Umbra’s web interface after setup, showing its version and update checks. Captured on 8 October 2026. [View the full-size panel.](../site/media/umbra-host-home.webp)

[Umbra Windows x64 releases](https://github.com/PreceptorOfMagic/Umbra/releases)

Open the latest release, expand Assets and choose the package described below. If no release is listed, that package has not been published.

**Using Vibepollo?** Install [Umbra (Vibepollo)](#umbra-vibepollo) instead; it keeps your Vibepollo settings. These steps describe the Apollo-based Umbra.

**Package:** the Windows x64 installer `Umbra-windows-x64.exe` attached to an Umbra release, not an Eclipse client ZIP. You need a Windows gaming PC, a supported GPU and current driver, administrator access for installation, and the games you intend to run already installed. Windows 11 x64 is the tested host OS.

1. Open the Umbra release, read its compatibility notes and expand **Assets**. Download the Windows x64 installer and matching checksum if supplied. Compare its SHA-256 hash with `Get-FileHash` in PowerShell before opening it.

1. Back up any existing host configuration and pairings. Umbra replaces Apollo in place, using the same Apollo installation folder and registry identity; installing Apollo again replaces Umbra. Do not expect them to run side by side. If Sunshine is installed separately, stop its service before starting Umbra to avoid competing for network ports or display resources. When upgrading from Apollo or an older Umbra, if setup stops making progress for more than a minute, end `reg.exe` in Task Manager (Details tab) and setup continues.

1. Run the installer and approve the Windows administrator prompt. The installer is unsigned for now, so Windows SmartScreen may warn; check the checksum first, then choose **More info → Run anyway**. Install the bundled virtual-display and controller/device components offered by the installer; there is no separate device-bridge installation step.

1. Allow host access on your trusted private network when Windows asks. Open the host’s web interface using its installed shortcut or tray action, create the local administrator login and review the available game/desktop entries.

1. Keep the client-driven display defaults. Pair Eclipse, approve its PIN in Umbra and test an ordinary Desktop or game session before adding another host.

For co-op, install the same compatible Umbra release on the second Windows PC. Co-op-specific defaults are separate from ordinary streaming settings. The Co-op Pane is built in and requested automatically by Eclipse, rather than created in the host’s editable Applications list. You should not create application entries, copy host IDs or tune encoder settings by hand.

<a name="umbra-vibepollo"></a>

## Umbra (Vibepollo) on Windows

[Umbra (Vibepollo) Windows x64 releases](https://github.com/PreceptorOfMagic/Umbra-Vibepollo/releases)

Open the latest release, expand Assets and choose the package described below. If no release is listed, that package has not been published.

**Package:** the Windows x64 installer `Umbra-Vibepollo-windows-x64.exe` attached to the latest Umbra (Vibepollo) release. It is built on [Vibepollo](https://github.com/Nonary/Vibepollo) instead of Apollo and carries the same additions for Eclipse; [compare the two versions](umbra.md#editions).

1. Download the installer and compare its SHA-256 hash with `Get-FileHash` in PowerShell before opening it. It is unsigned for now, so Windows SmartScreen may warn; check the hash, then choose **More info → Run anyway**.

1. **Installing over Vibepollo keeps your settings.** Umbra (Vibepollo) upgrades a Vibepollo installation in place, the same way Vibepollo upgrades itself: your configuration, applications and paired devices stay. The installer shows **Switch to Umbra (Vibepollo)**. Installing over Apollo or the Apollo-based Umbra also keeps settings and pairings; the installer removes the old program first. Back up your host configuration before switching anyway.

1. Keep the bundled virtual-display and virtual gamepad drivers selected. Until code signing is set up, the gamepad driver is signed with Umbra’s own certificate, which the installer adds to the PC’s trusted certificates.

1. Open the host’s web interface from the Start menu or tray, sign in, pair Eclipse and test an ordinary Desktop stream before co-op. For co-op, install a compatible Umbra on the second PC as well.

1. **Switching back to Vibepollo:** run Vibepollo’s own installer. It replaces Umbra (Vibepollo) in place and keeps the same settings, without the Umbra additions Eclipse uses for co-op.

<a name="umbra-linux"></a>

## 1B. Umbra on Linux

[Umbra for Linux release](https://github.com/PreceptorOfMagic/Umbra/releases/tag/umbra-linux-v0.5.1)

Open the Umbra for Linux release and expand Assets. If no release is listed, that package has not been published.

**Package:** `Umbra-<version>-linux-x86_64.flatpak`, one Flatpak bundle for x86_64 Linux. You need KDE Plasma or GNOME on Wayland (an X11 desktop gives ordinary streaming only), an NVIDIA or AMD GPU with its current driver, and the games you intend to run already installed. It has been tested on Ubuntu 26.04 with KDE Plasma and with GNOME, on an NVIDIA RTX 2060 SUPER and an AMD Radeon RX Vega.

If you installed the earlier Ubuntu `.deb` (Umbra 0.5.0), remove it first with `systemctl --user disable --now sunshine` and `sudo apt remove umbra`. The Flatpak keeps its own settings, so pair Eclipse with it again.

1. Install Flatpak and add Flathub if you have not already (Ubuntu does not include Flatpak by default):

```sh
sudo apt install flatpak
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
```

1. Download the `.flatpak` and its `.sha256` from the release’s **Assets** into one folder, check it and install it:

```sh
sha256sum -c Umbra-<version>-linux-x86_64.flatpak.sha256
flatpak install --user Umbra-<version>-linux-x86_64.flatpak
```

1. Flatpak fetches the Freedesktop runtime and, on NVIDIA, the driver extension matching your installed driver. Start **Umbra** from the applications menu.

1. Accept **Input Setup** when it is offered. It installs the input rule that streamed controllers, mouse and keyboard need, through your desktop’s administrator prompt, and can start Umbra whenever you sign in. You can reopen it from the applications menu. If the desktop asks to allow screen sharing, allow it.

1. Open `https://localhost:47990` in a browser on that PC, create the local administrator login and review the game/desktop entries. If a firewall is enabled, allow the host on your trusted private network.

1. Keep the client-driven display defaults. Pair Eclipse, approve its PIN in Umbra and test an ordinary Desktop or game session before adding another host.

| Desktop | Streaming | Own virtual display per stream | Co-op | HDR |
|---|---|---|---|---|
| KDE Plasma on Wayland (tested: Ubuntu 26.04, KWin 6.6.6) | Yes | Yes | Yes | With the KDE HDR extra |
| GNOME on Wayland (tested: Ubuntu 26.04, Mutter 50.1) | Yes | Yes | Yes | With the GNOME HDR extra; a physical HDR monitor streams HDR without it |
| X11 desktops (Cinnamon, Xfce, MATE …) | Yes (tested during development on Linux Mint 22.3) | No | No | No |
| Sway, Hyprland and other wlroots desktops, COSMIC | Not supported | | | |

Other distributions running KDE Plasma or GNOME on Wayland are expected to behave like those rows but have not been tested. An X11 desktop has no way to create a display while it runs, so there the host streams the desktop but never offers co-op or HDR.

**GPUs.** NVIDIA (tested: RTX 2060 SUPER, driver 595) and AMD (tested: Radeon RX Vega) both encode on the GPU. On AMD the card’s own video encoder sets the limit: an RX Vega reaches about 60 fps at 4K and 165 fps only at 1080p, its co-op panes about 35 fps, and it has no 10-bit encoder, so its ordinary streams are SDR. Intel GPUs and PCs with more than one GPU are untested.

**Co-op.** A Linux host and a Windows host can share one co-op session (tested with Umbra 0.5.0 on Windows). Two Linux hosts together are untested.

<a name="umbra-linux-hdr"></a>

### HDR extras (optional, Ubuntu 26.04)

Stock KWin and Mutter keep the virtual displays Umbra streams SDR. The release carries two optional extras that add HDR virtual displays and 10-bit screen capture: patched KWin packages for KDE Plasma (`Umbra-HDR-KDE-ubuntu26.04.tar.gz`) and patched Mutter packages for GNOME (`Umbra-HDR-GNOME-ubuntu26.04.tar.gz`). Umbra detects them by itself. They are built for Ubuntu 26.04’s own KWin 6.6.6 and Mutter 50.1; do not install them on any other version.

1. Check your version. On KDE, `dpkg-query -W kwin-wayland` must print `4:6.6.6-0ubuntu0.1`; on GNOME, `dpkg-query -W libmutter-18-0` must print `50.1-0ubuntu2.4`.

1. Download the extra for your desktop, unpack it, check it and install its packages (the KDE extra is shown; the GNOME one is the same with `GNOME` in its name):

```sh
tar -xzf Umbra-HDR-KDE-ubuntu26.04.tar.gz
cd Umbra-HDR-KDE-ubuntu26.04
sha256sum -c SHA256SUMS
sudo dpkg -i *.deb
```

1. Log out and back in, then make Umbra check the desktop again before starting it from the applications menu:

```sh
flatpak kill io.github.PreceptorOfMagic.Umbra
rm -f ~/.var/app/io.github.PreceptorOfMagic.Umbra/config/sunshine/*_virtual_hdr
```

1. Check that Umbra offers HDR: `curl -s http://localhost:47989/serverinfo | grep -o '<UmbraCoopHdr>[01]'` prints `<UmbraCoopHdr>1`. Then turn HDR on for this host in Eclipse.

The extras replace your desktop’s compositor packages. An Ubuntu update of KWin or Mutter replaces them again and streams return to SDR; do not reinstall these packages over a newer version. Each extra’s `README.txt` has the one-line rollback, and the patches and source packages are published with the release.

To remove Umbra, run `flatpak run --command=remove-additional-install.sh io.github.PreceptorOfMagic.Umbra` to remove the input rule and sign-in start, then `flatpak uninstall --user io.github.PreceptorOfMagic.Umbra`.

<a name="eclipse-webos"></a>

## 2A. Eclipse on LG webOS

![LG webOS home screen with Eclipse’s purple split-screen icon selected in the app row.](../site/media/eclipse-webos-launcher.webp)

After installation, choose Eclipse’s purple split-screen icon in the TV’s app row. Shown on LG G5 / webOS 26.

[LG webOS releases](https://github.com/PreceptorOfMagic/Eclipse/releases)

Open the latest release, expand Assets and choose the package described below. If no release is listed, that package has not been published.

**Package:** the standard `com.aurora.gamestream_<version>_arm.ipk` asset. The inherited package ID is intentional; do not choose a separate beta-app package. You need a supported LG webOS TV, an LG Developer account, a computer and a shared network. Current physical coverage is the LG G5 on webOS 26.

1. On the TV, install **Developer Mode** from Apps, sign in with your LG Developer account, enable Dev Mode Status and reboot when requested. Follow [LG’s official Developer Mode guide](https://webostv.developer.lge.com/develop/getting-started/developer-mode-app).

1. On your computer, get [webOS Dev Manager](https://github.com/webosbrew/dev-manager-desktop/releases/latest): Windows x64 MSI, macOS DMG or Linux AppImage/DEB as appropriate. Install and open it.

1. Open Developer Mode on the TV and enable **Key Server**. Add the TV in Dev Manager using the address and case-sensitive passphrase displayed by the TV. Keep both devices on the same reachable network.

1. Download Eclipse’s `.ipk` asset to the computer. In Dev Manager, select the TV, open **Apps**, choose **Install** and select that file.

1. Launch Eclipse from the TV’s app list, then [pair an Umbra PC](#pairing). To update, install the newer `.ipk` the same way; settings and pairings are kept. After an update, close and reopen Eclipse.

Keep Developer Mode active and extend its session before it expires. LG removes development-installed apps when Developer Mode is disabled. This installation method does not require rooting your TV.

<a name="eclipse-windows"></a>

## 2B. Eclipse on Windows


![Eclipse on Windows after launch, with a paired PC’s apps](../site/media/eclipse-windows-window.webp)
[Windows x64 releases](https://github.com/PreceptorOfMagic/Eclipse/releases)

Open the latest release, expand Assets and choose the package described below. If no release is listed, that package has not been published.

**Package:** the installer `eclipse-windows-x64-setup-unsigned.exe`, or the portable `eclipse-windows-x64-unsigned.zip`, each with its adjacent `.sha256` file. Windows 11 x64 is tested; the source minimum is Windows 10 version 1803, which has not received the same physical testing. An up-to-date GPU driver with compatible D3D11VA hardware decoding is required. Windows ARM is not a tested target.

1. Download the installer and its checksum from the same Eclipse release. In PowerShell run `Get-FileHash ./eclipse-windows-x64-setup-unsigned.exe -Algorithm SHA256` and compare the hash with the downloaded checksum.

1. Run the installer as your normal Windows user. It installs Eclipse for your user only, without administrator access, and adds Start menu entries and an Apps & features uninstaller. Installing a newer version over an older one keeps your settings and pairings.

1. The current build is unsigned, so Windows may show a SmartScreen warning. Check the repository, release and checksum before deciding whether to run it; do not disable Windows security globally.

1. For portable use instead, right-click the ZIP and choose **Extract All** to a folder you intend to keep, then run `moonlight-tv.exe` from it. The inherited executable name is expected. Do not run the app from inside the ZIP or move its executable away from the supplied DLLs, data and notices.

1. [Pair your host](#pairing). To remove Eclipse, use **Apps & features**; the uninstaller lets you keep your settings.

<a name="eclipse-linux"></a>

## 2C. Eclipse on Linux


![Eclipse on Linux, started with ./eclipse, with a paired PC’s apps](../site/media/eclipse-linux-window.webp)
[Linux x86_64 releases](https://github.com/PreceptorOfMagic/Eclipse/releases)

Open the latest release, expand Assets and choose the package described below. If no release is listed, that package has not been published.

**Package:** `eclipse-linux-x86_64.tar.gz`. Use an x86_64 Linux desktop with glibc 2.35 or newer (Ubuntu 22.04 baseline), a graphical session and working GPU drivers. Bundled application libraries do not replace your graphics driver. Current testing is in WSL Linux environments, not broad native-Linux certification.

1. Download the portable archive and, when supplied, its matching SHA-256 file from the same release. Compare `sha256sum eclipse-linux-x86_64.tar.gz` with that checksum.

1. Extract and install from a terminal:

```sh
tar -xzf eclipse-linux-x86_64.tar.gz
cd eclipse-linux-x86_64
./install.sh
```

1. `install.sh` installs Eclipse for your user, without a password, and adds it to the applications menu; the downloaded folder can then be deleted. Installing a newer version the same way keeps your settings and pairings.

1. For portable use instead, run `./eclipse` from the extracted folder and keep the folder together; `./install-desktop-entry.sh` adds that copy to the menu. Then [pair the host](#pairing). To remove an installed copy, run `~/.local/share/eclipse/app/uninstall.sh` (add `--keep-settings` to keep your settings and pairings).

1. If hardware decoding fails, update the relevant NVIDIA or Mesa/VAAPI driver and include the exact driver and desktop session in a report. Native AMD/Intel VAAPI still needs validation; the WSL VAAPI test path has known instability.

Use the portable archive instructions for Ubuntu, Fedora and Arch-style systems meeting these requirements. Do not substitute an ARM package or assume a source archive is a distro installer.

<a name="pairing"></a>

## 3. Pair and play one PC.

1. Put the Eclipse device and host on the same trusted network for first setup; wired Ethernet is strongly recommended for two simultaneous streams.

1. Open Eclipse. Select the discovered PC, or add the host’s local address if discovery does not find it.

1. Request pairing in Eclipse, then enter its displayed PIN in Umbra’s pairing page on that PC. The first device paired with a PC gets full permissions. For any later device, allow **Launch Apps** and **Controller Input** under **PIN → Device Management**, or starting a game is refused with “403 Permission denied”.

1. Choose a game or desktop from that host’s app list. Confirm picture, audio and controls in a normal one-PC session.

1. Connect your controllers to the client device (or use its keyboard/mouse). Start with a resolution and frame rate both ends support; increase quality after the connection is working.

For remote access outside your home, establish a trusted private connection between the devices first. Do not expose the host’s administration interface to the public internet.

<a name="coop"></a>

## 4. Add the second PC.


![The co-op dialog: two PCs, a layout and which side is Player 1](../site/media/eclipse-coop-dialog.webp)
1. Pair two distinct Umbra PCs and verify a normal stream from each one.

1. In Eclipse choose **Co-op**, select the two hosts, choose side-by-side or stacked, and choose the primary/Player 1 side.

1. Assign each controller to its player and select the desired audio behaviour. Start the session; the client and hosts negotiate compatible stream and encoder settings. The first time, Eclipse asks once which graphics card make each PC has.

1. Launch the games on their respective PCs. Each game still has its own session, accounts and multiplayer requirements.

The normal install flow uses working co-op defaults. Eclipse requests the built-in Co-op Pane when needed; it does not need to appear in Umbra’s editable Applications list. Disconnect pauses the co-op session so it can be resumed; Quit ends the session on both hosts. If an older build asks for manual setup, check the matching release notes instead of copying hidden settings from a development guide.

**Settings → Co-op → Play shared sounds once** (Accurate by default) plays a sound both games make, such as narration or music, only once. Some games choose their music at random on each PC, so the two PCs play different tracks the filter cannot merge; if music sounds doubled or messy, turn the game’s music off on one PC.

If Eclipse is running on one of the gaming PCs, controls for that PC can behave differently: its local game reads its controller directly. Keyboard/mouse focus and virtual-display placement remain areas of active testing. A TV or separate client avoids that local-host focus complication.

<a name="diagnostics"></a>

## Something not working?

1. In Eclipse open **Settings → About → Keep diagnostic logs**, enable it, then restart the app.

1. Reproduce the problem and return to **Share logs…**.

1. On Windows use **Open folder** and attach `logs/eclipse-logs.txt`. Linux offers the saved bundle and a local-network sharing page. On webOS, open the displayed sharing address on another device and download **everything as one file** (`all.txt`), then stop sharing.

1. Review logs for hostnames, addresses and other personal details before sharing. Include app versions, OS/firmware, GPU and driver, layout, resolution/frame rate, steps to reproduce and whether a normal stream works.

Post in [Eclipse issues](https://github.com/PreceptorOfMagic/Eclipse/issues/new/choose), [Umbra issues](https://github.com/PreceptorOfMagic/Umbra/issues/new/choose), or reply to the social-media thread where you found the project. Link related reports rather than losing the context across two places.

[Eclipse/Umbra licence & notices](../LICENSES.md) · [GPL-3.0](../LICENSE.txt)

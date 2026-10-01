[Project Hub](../README.md) · [Installation Guide](installation.md) · [Eclipse](https://github.com/PreceptorOfMagic/Eclipse) · [Umbra](https://github.com/PreceptorOfMagic/Umbra) · [Development](development.md) · [Acknowledgements](../ACKNOWLEDGEMENTS.md)

Installation Guide

# From download to first stream.

Install Umbra on each gaming PC, then Eclipse on the display device. Start with one working stream before adding the second host.

[Umbra · Windows](#umbra-windows) · [Eclipse · LG webOS](#eclipse-webos) · [Eclipse · Windows](#eclipse-windows) · [Eclipse · Linux](#eclipse-linux)

<a name="before-you-start"></a>

## Choose the right component.

### Gaming PC → Umbra

Windows x64 host. Install once for ordinary streaming, twice for two-PC co-op. The game runs here.

### Screen device → Eclipse

LG webOS, Windows x64 or Linux x86_64 client. Install the package matching the device where you will view and control the stream.

Download an attached file under **Assets**, not GitHub’s automatically generated **Source code (zip)** or **Source code (tar.gz)**. Those are developer archives, not installable apps. Use the latest compatible stable release. If no package is attached for your platform, that download is not available.

[Pairing](#pairing) · [First co-op session](#coop) · [Troubleshooting and logs](#diagnostics) · [Tested hardware](../README.md#status)

<a name="umbra-windows"></a>

## 1. Umbra on Windows

[Umbra Windows x64 releases](https://github.com/PreceptorOfMagic/Umbra/releases)

Open the latest release, expand Assets and choose the package described below. If no release is listed, that package has not been published.

**Package:** the Windows x64 installer `.exe` attached to an Umbra release, not an Eclipse client ZIP. You need a Windows gaming PC, a supported GPU and current driver, administrator access for installation, and the games you intend to run already installed. Windows 11 x64 is the tested host OS.

1. Open the Umbra release, read its compatibility notes and expand **Assets**. Download the Windows x64 installer and matching checksum if supplied. Compare its SHA-256 hash with `Get-FileHash` in PowerShell before opening it.

1. If you already run Sunshine or Apollo, stop that host service before starting Umbra so two hosts do not compete for the same network ports or display resources. Keep a backup of its configuration before migrating.

1. Run the installer and approve the Windows administrator prompt. Install the bundled virtual-display and controller/device components offered by the installer; there is no separate device-bridge installation step.

1. Allow host access on your trusted private network when Windows asks. Open the host’s web interface using its installed shortcut or tray action, create the local administrator login and review the available game/desktop entries.

1. Keep the client-driven display defaults. Pair Eclipse, approve its PIN in Umbra and test an ordinary Desktop or game session before adding another host.

For co-op, install the same compatible Umbra release on the second Windows PC. Co-op-specific defaults are separate from ordinary streaming settings. The Co-op Pane is created automatically as part of first co-op use; you should not create application entries, copy host IDs or tune encoder settings by hand.

<a name="eclipse-webos"></a>

## 2A. Eclipse on LG webOS

[LG webOS releases](https://github.com/PreceptorOfMagic/Eclipse/releases)

Open the latest release, expand Assets and choose the package described below. If no release is listed, that package has not been published.

**Package:** the standard `com.aurora.gamestream_<version>_arm.ipk` asset. The inherited package ID is intentional; do not choose a separate beta-app package. You need a supported LG webOS TV, an LG Developer account, a computer and a shared network. Current physical coverage is the LG G5 on webOS 26.

1. On the TV, install **Developer Mode** from Apps, sign in with your LG Developer account, enable Dev Mode Status and reboot when requested. Follow [LG’s official Developer Mode guide](https://webostv.developer.lge.com/develop/getting-started/developer-mode-app).

1. On your computer, get [webOS Dev Manager](https://github.com/webosbrew/dev-manager-desktop/releases/latest): Windows x64 MSI, macOS DMG or Linux AppImage/DEB as appropriate. Install and open it.

1. Open Developer Mode on the TV and enable **Key Server**. Add the TV in Dev Manager using the address and case-sensitive passphrase displayed by the TV. Keep both devices on the same reachable network.

1. Download Eclipse’s `.ipk` asset to the computer. In Dev Manager, select the TV, open **Apps**, choose **Install** and select that file.

1. Launch Eclipse from the TV’s app list, then [pair an Umbra PC](#pairing). After an update, close and reopen Eclipse.

Keep Developer Mode active and extend its session before it expires. LG removes development-installed apps when Developer Mode is disabled. This installation method does not require rooting your TV.

<a name="eclipse-windows"></a>

## 2B. Eclipse on Windows

[Windows x64 releases](https://github.com/PreceptorOfMagic/Eclipse/releases)

Open the latest release, expand Assets and choose the package described below. If no release is listed, that package has not been published.

**Package:** `eclipse-windows-x64-unsigned.zip` and its adjacent `.sha256` file. Windows 11 x64 is tested; the source minimum is Windows 10 version 1803, which has not received the same physical testing. An up-to-date GPU driver with compatible D3D11VA hardware decoding is required. Windows ARM is not a tested target.

1. Download both files from the same Eclipse release. In PowerShell run `Get-FileHash ./eclipse-windows-x64-unsigned.zip -Algorithm SHA256` and compare the hash with the downloaded checksum.

1. Right-click the ZIP and choose **Extract All** to a folder you intend to keep. Do not run the app from inside the ZIP or move its executable away from the supplied DLLs, data and notices.

1. Open the extracted folder and run `moonlight-tv.exe` as your normal Windows user. The inherited executable name is expected. Eclipse does not require administrator access, a compiler or MSYS2.

1. The current portable build is unsigned, so Windows may show a SmartScreen warning. Check the repository, release and checksum before deciding whether to run it; do not disable Windows security globally.

1. [Pair your host](#pairing). To update, close Eclipse and extract the new release into a new folder, keeping the previous version available until the new one works.

<a name="eclipse-linux"></a>

## 2C. Eclipse on Linux

[Linux x86_64 releases](https://github.com/PreceptorOfMagic/Eclipse/releases)

Open the latest release, expand Assets and choose the package described below. If no release is listed, that package has not been published.

**Package:** `eclipse-linux-x86_64.tar.gz`. Use an x86_64 Linux desktop with glibc 2.35 or newer (Ubuntu 22.04 baseline), a graphical session and working GPU drivers. Bundled application libraries do not replace your graphics driver. Current testing is in WSL Linux environments, not broad native-Linux certification.

1. Download the portable archive and, when supplied, its matching SHA-256 file from the same release. Compare `sha256sum eclipse-linux-x86_64.tar.gz` with that checksum.

1. Extract and launch from a terminal:

```sh
tar -xzf eclipse-linux-x86_64.tar.gz
cd eclipse-linux-x86_64
./eclipse
```

1. Keep the extracted directory together. Use the `eclipse` launcher, which configures the bundled runtime, instead of invoking its internal executable.

1. Optionally run `./install-desktop-entry.sh` from that folder to add a launcher for your user. Then [pair the host](#pairing).

1. If hardware decoding fails, update the relevant NVIDIA or Mesa/VAAPI driver and include the exact driver and desktop session in a report. Native AMD/Intel VAAPI still needs validation; the WSL VAAPI test path has known instability.

Use the portable archive instructions for Ubuntu, Fedora and Arch-style systems meeting these requirements. Do not substitute an ARM package or assume a source archive is a distro installer.

<a name="pairing"></a>

## 3. Pair and play one PC.

1. Put the Eclipse device and host on the same trusted network for first setup; wired Ethernet is strongly recommended for two simultaneous streams.

1. Open Eclipse. Select the discovered PC, or add the host’s local address if discovery does not find it.

1. Request pairing in Eclipse, then enter its displayed PIN in Umbra’s pairing page on that PC. Review client permissions, particularly for later paired devices.

1. Choose a game or desktop from that host’s app list. Confirm picture, audio and controls in a normal one-PC session.

1. Connect your controllers to the client device (or use its keyboard/mouse). Start with a resolution and frame rate both ends support; increase quality after the connection is working.

For remote access outside your home, establish a trusted private connection between the devices first. Do not expose the host’s administration interface to the public internet.

<a name="coop"></a>

## 4. Add the second PC.

1. Pair two distinct Umbra PCs and verify a normal stream from each one.

1. In Eclipse choose **Co-op**, select the two hosts, choose side-by-side or stacked, and choose the primary/Player 1 side.

1. Assign each controller to its player and select the desired audio behaviour. Start the session; the client and hosts negotiate compatible stream and encoder settings.

1. Launch the games on their respective PCs. Each game still has its own session, accounts and multiplayer requirements.

The normal install flow uses working co-op defaults. Separate co-op options and the host’s Co-op Pane appear through first use; there is no manual application-entry preparation. If an older build asks for it, check the matching release notes instead of copying hidden settings from a development guide.

If Eclipse is running on one of the gaming PCs, controls for that PC can behave differently: its local game reads its controller directly. Keyboard/mouse focus and virtual-display placement remain areas of active testing. A TV or separate client avoids that local-host focus complication.

<a name="diagnostics"></a>

## Something not working?

1. In Eclipse open **Settings → About → Keep diagnostic logs**, enable it, then restart the app.

1. Reproduce the problem and return to **Share logs…**.

1. On Windows use **Open folder** and attach `logs/eclipse-logs.txt`. Linux offers the saved bundle and a local-network sharing page. On webOS, open the displayed sharing address on another device and download **everything as one file** (`all.txt`), then stop sharing.

1. Review logs for hostnames, addresses and other personal details before sharing. Include app versions, OS/firmware, GPU and driver, layout, resolution/frame rate, steps to reproduce and whether a normal stream works.

Post in [Eclipse issues](https://github.com/PreceptorOfMagic/Eclipse/issues/new/choose), [Umbra issues](https://github.com/PreceptorOfMagic/Umbra/issues/new/choose), or reply to the social-media thread where you found the project. Link related reports rather than losing the context across two places.

[Eclipse/Umbra licence & notices](../LICENSES.md) · [GPL-3.0](../LICENSE.txt)
